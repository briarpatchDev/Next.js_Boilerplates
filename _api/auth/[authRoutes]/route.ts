// Import necessary modules
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { randomString } from "@/app/lib/randomString";
import { connectToDatabase } from "@/app/lib/mongodb";
import { SES, SendEmailCommand } from "@aws-sdk/client-ses";
import {
  verification_email,
  password_email,
} from "@/app/lib/emails/account_emails";

const ses = new SES({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.SES_ACCESS_KEY ?? "",
    secretAccessKey: process.env.SES_SECRET ?? "",
  },
});

//Different POST routes related to login and account creation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ authRoutes: string }> }
) {
  try {
    const { authRoutes } = await params;
    switch (authRoutes) {
      case "login":
        return await login(req);
      case "logout":
        return await logout(req);
      case "signup":
        return await sendVerification(req);
      case "verifyEmail":
        return await verifyEmail(req);
      case "sendPasswordReset":
        return await sendPasswordReset(req);
      case "checkPasswordCode":
        return await checkPasswordCode(req);
      case "changePassword":
        return await changePassword(req);
      case "deleteAccount":
        return await deleteAccount(req);
      default:
        return networkError();
    }
  } catch {
    return networkError();
  }
}

//Delete Routes
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ authRoutes: string }> }
) {
  try {
    const { authRoutes } = await params;
    switch (authRoutes) {
      case "deleteAccount":
        return await deleteAccount(req);
      default:
        return networkError();
    }
  } catch {
    return networkError();
  }
}

//RegExps used in validation
const emailRegExp = new RegExp(
  "^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,256})$"
);
const passwordRegExp = new RegExp(
  "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*[!@#$%^&*_0-9]).{8,32}$"
);

/*  Responses:
 *  These are frequently used responses / error messages in the login system
 */
//Response for when the task completed successfully
function success() {
  return NextResponse.json({
    success: true,
  });
}
//Response for when the task fails
function failure() {
  return NextResponse.json({
    errors: "Unable to complete the requested action",
  });
}
//Error for when api route breaks during something like a database operation
function networkError() {
  return NextResponse.json({
    errors: "Something went wrong. Try again soon.",
  });
}
//Error for when api route breaks when using a form with a password
function networkErrorPassword() {
  return NextResponse.json({
    errors: { password: "Something went wrong. Try again soon." },
  });
}
//Error for when username / password is not valid
function wrongCredentials() {
  return NextResponse.json({
    errors: { password: "Incorrect username or password" },
  });
}

//Checks if max email limit has been exceeded. We are setting it up as 1000 per day
async function canSendEmail(): Promise<boolean> {
  try {
    const db = await connectToDatabase("analytics");
    const current_metrics = db.collection("current_metrics");
    const record = await current_metrics.findOne({ name: "emails_sent" });
    if (record) {
      if (record.emails_sent < record.max_emails) {
        return true;
      }
      return false;
    } else {
      await current_metrics.insertOne({
        name: "emails_sent",
        emails_sent: 0,
        max_emails: 1000,
      });
      return true;
    }
  } catch {
    return false;
  }
}

// Increments the daily emails sent, should occur after a successful email send
async function updateEmailCount() {
  const db = await connectToDatabase("analytics");
  const current_metrics = db.collection("current_metrics");
  await current_metrics.updateOne(
    { name: "emails_sent" },
    { $inc: { emails_sent: 1 } }
  );
}

//Attempts to log user in
async function login(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email.trim().toLowerCase();
    //Checks if email address and password are valid
    if (!emailRegExp.test(email) || !passwordRegExp.test(body.password)) {
      return wrongCredentials();
    }
    //Finds the user's account
    const db = await connectToDatabase("accounts");
    const accounts = db.collection("accounts");
    const user = await accounts.findOne({
      email: email,
    });
    if (!user) {
      // We await for a random timeout here to create the illusion that a password is being checked
      await new Promise((resolve) =>
        setTimeout(resolve, Math.floor(Math.random() * 400) + 100)
      );
      return wrongCredentials();
    }
    //Logs in user if password is correct
    if (await bcrypt.compare(body.password, user.password)) {
      const sessionId = randomString(48);
      await accounts.updateOne(
        { email: user.email },
        {
          $set: { sessionId: sessionId },
        }
      );
      const cookieStore = await cookies();
      cookieStore.set({
        name: "sessionId",
        //value: sessionId,
        value: sessionId,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
      });
      return success();
    } else {
      return wrongCredentials();
    }
  } catch {
    return networkErrorPassword();
  }
}

// Replaces users sessionId with a new random one. Used on logout
async function invalidateSession(sessionId: string) {
  try {
    const db = await connectToDatabase("accounts");
    const accounts = db.collection("accounts");
    const newSessionId = randomString(48);
    await accounts.updateOne(
      { sessionId: sessionId },
      { $set: { sessionId: newSessionId } }
    );
  } catch {}
}

//Logs the user out
async function logout(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?.value;
    cookieStore.delete("sessionId");
    if (sessionId) {
      // Replaces users sessionId in the db, we can run this without waiting for it
      invalidateSession(sessionId);
    }
    return success();
  } catch {
    const cookieStore = await cookies();
    cookieStore.delete("sessionId");
    return networkError();
  }
}

//Attempts to send a verification email to user
async function sendVerification(req: NextRequest) {
  try {
    //Checking if credentials are valid
    const body = await req.json();
    const email = body.email.trim().toLowerCase();
    let errors = {
      email: "",
      password: "",
    };
    if (!emailRegExp.test(email)) {
      errors.email = `Invalid email`;
    }
    if (!passwordRegExp.test(body.password)) {
      errors.password = `Make your password stronger`;
    } else if (body.password !== body.verify_password) {
      errors.password = `Passwords do not match`;
    }
    const errorFound = Object.values(errors).some(Boolean);
    if (errorFound) {
      return NextResponse.json({
        errors: errors,
      });
    }
    //Checking if we can send an email currently
    const canEmail = await canSendEmail();
    if (!canEmail) return networkError();
    //Checks to see if account already exists
    const db = await connectToDatabase("accounts");
    const accounts = db.collection("accounts");
    const duplicateAccount = await accounts.findOne({ email: email });
    //Checks to see if user is requesting too many verification emails
    const unverified_accounts = db.collection("unverified_accounts");
    const spamCheck = await unverified_accounts
      .find({ email: email })
      .toArray();
    if (duplicateAccount || spamCheck.length > 4) {
      //Returns a false positive but doesn't send any emails
      return success();
    } else {
      const verificationCode = randomString(32);
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const user = {
        email: email,
        password: hashedPassword,
        code: verificationCode,
        createdAt: new Date(),
      };
      await unverified_accounts.insertOne(user);
      // Send verification email with SES
      const emailParams = {
        Source: '"Website" <noreply@website.com>',
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Data: "Website Verification",
          },
          Body: {
            Html: {
              Data: verification_email(verificationCode),
            },
          },
        },
      };
      const command = new SendEmailCommand(emailParams);
      ses.send(command);
      updateEmailCount();
      return success();
    }
  } catch {
    return networkErrorPassword();
  }
}

// Verifies the user's email and creates their account
async function verifyEmail(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await connectToDatabase(`accounts`);
    const unverified_accounts = db.collection("unverified_accounts");
    const accountFromCode = await unverified_accounts.findOne({
      code: body.code,
    });
    if (!accountFromCode) return failure();
    // User might have multiple verification emails, making sure we're using the latest one
    const account = await unverified_accounts
      .find({ email: accountFromCode.email })
      .sort({ createdAt: -1 })
      .limit(1)
      .next();
    if (!account || account.code !== body.code || account.verified === true) {
      return failure();
    }
    const accounts = db.collection("accounts");
    // We have previously created a unique index for "email" in our "accounts" collection
    // await accounts.createIndex({ email: 1 }, { unique: true });
    await accounts.insertOne({
      email: account.email,
      password: account.password,
      createdAt: new Date(),
      lastActive: new Date(),
    });
    return success();
  } catch {
    return failure();
  }
}

// Sends a password reset email to a user and creates a temporary db entry for it
async function sendPasswordReset(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email.trim().toLowerCase();
    if (!emailRegExp.test(email)) return wrongCredentials();
    //Checking if we can send an email currently
    const canEmail = await canSendEmail();
    if (!canEmail) return networkError();
    //Getting their account
    const db = await connectToDatabase("accounts");
    const resets = db.collection("password_resets");
    const accounts = db.collection("accounts");
    const account = await accounts.findOne({ email: email });
    const spamCheck = await resets.find({ email: email }).toArray();
    if (spamCheck.length > 4 || !account) {
      // We await for a random timeout here to prevent timing attacks
      await new Promise((resolve) =>
        setTimeout(resolve, Math.floor(Math.random() * 600) + 300)
      );
      return success();
    }
    const passwordCode = randomString(48);
    await resets.insertOne({
      email: email,
      code: passwordCode,
      createdAt: new Date(),
    });
    await accounts.updateOne(
      { email: email },
      { $set: { passwordCode: passwordCode } }
    );
    const emailParams = {
      Source: '"Website" <noreply@website.com>',
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: "Website Password Reset",
        },
        Body: {
          Html: {
            Data: password_email(passwordCode),
          },
        },
      },
    };
    const command = new SendEmailCommand(emailParams);
    ses.send(command);
    updateEmailCount();
    return success();
  } catch {
    return networkError();
  }
}

// Verifies the user has a valid code when they visit /change-password/[code]
async function checkPasswordCode(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await connectToDatabase(`accounts`);
    const password_resets = db.collection("password_resets");
    const resetRecord = await password_resets.findOne({
      code: body.code,
    });
    if (!resetRecord) return failure();
    // User might have multiple password resets, making sure we're using the latest one
    const latestRecord = await password_resets
      .find({ email: resetRecord.email })
      .sort({ createdAt: -1 })
      .limit(1)
      .next();
    if (!latestRecord || latestRecord.code !== body.code) {
      return failure();
    }
    //Checking that the verification code matches the one in their account
    const accounts = db.collection("accounts");
    const account = await accounts.findOne({ passwordCode: body.code });
    if (!account) return failure();
    return success();
  } catch {
    return failure();
  }
}

// Changes the users password
async function changePassword(req: NextRequest) {
  try {
    const body = await req.json();
    //Checking if credentials are valid
    let errors = {
      password: "",
    };
    if (!passwordRegExp.test(body.password)) {
      errors.password = `Make your password stronger`;
    } else if (body.password !== body.verify_password) {
      errors.password = `Passwords do not match`;
    }
    const errorFound = Object.values(errors).some(Boolean);
    if (errorFound) {
      return NextResponse.json({
        errors: errors,
      });
    }
    if (!body.code) return networkErrorPassword();
    // Updating their password
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const db = await connectToDatabase("accounts");
    const accounts = db.collection("accounts");
    const result = await accounts.findOneAndUpdate(
      { passwordCode: body.code },
      { $set: { password: hashedPassword }, $unset: { passwordCode: "" } }
    );
    if (!result) {
      return NextResponse.json({
        errors: {
          alreadyChanged: true,
        },
      });
    }
    return success();
  } catch {
    return networkErrorPassword();
  }
}

async function deleteAccount(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email.trim().toLowerCase();
    //Checking if email is valid
    let errors = {
      email: "",
    };
    if (!emailRegExp.test(email)) {
      errors.email = `Enter your email`;
      return NextResponse.json({ errors: errors });
    }
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?.value;
    if (!sessionId) {
      return NextResponse.json({ errors: { logout: true } });
    }
    const db = await connectToDatabase("accounts");
    const accounts = db.collection("accounts");
    const account = await accounts.findOne({ sessionId: sessionId });
    if (!account) {
      cookieStore.delete("sessionId");
      return NextResponse.json({ errors: { logout: true } });
    }
    if (account.email === email) {
      await accounts.deleteOne({ sessionId: sessionId });
      cookieStore.delete("sessionId");
      return success();
    } else {
      errors.email = `Incorrect email`;
      return NextResponse.json({ errors: errors });
    }
  } catch {
    return networkError();
  }
}

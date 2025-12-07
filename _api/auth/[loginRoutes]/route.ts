// Import necessary modules
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";

//Different POST routes related to login and account creation
export async function POST(
  req: NextRequest,
  { params }: { params: { loginRoutes: string } }
) {
  try {
    switch (params.loginRoutes) {
      case "login":
        return await login(req);
      case "logout":
        return await logout(req);
      case "sendVerification":
        return await sendVerification(req);
      case "verifyEmail":
        return await verifyEmail(req);
      default:
        return networkError();
    }
  } catch {
    return networkError();
  }
}

//Returns a random string, used for creating passwords and sessions
function generateString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += characters.charAt(array[i] % characters.length);
  }
  return result;
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
    errors: "Something went wrong. Try again soon.",
  });
}
//Error for when username / password is not valid
function wrongCredentials() {
  return NextResponse.json({
    errors: { password: "Incorrect username or password" },
  });
}

// Searches a database for an entry and retrieves the values of the inputed fields
// database - the name of the database to search through
// field - the parameter used to search the DB for the account
// value - the value of that parameter
// fields - the name of the fields you want the values of
async function getValues(
  database: string,
  field: string,
  value: string,
  fields?: string[]
) {
  try {
    /**
     * Implement DB-logic to retrieve the values here, placeholder below
     * I know what the real password is
     */
    let result: Record<string, any> = {
      email: "somebody@gmail.com",
      password: "$2a$10$rKVzaEJI8uJsbIUbCcMPOu8r57.HJfu4odFFsLqT7ucQt8tWF98mC",
      code: "markon",
    };
    return result;
  } catch {
    return {};
  }
}

// Searches a database for all entries with a value and retrieves the values of the inputed fields
// database - the name of the database to search through
// field - the parameter used to search the DB for the account
// value - the value of that parameter
// fields - the name of the fields you want the values of
async function getAllValues(
  database: string,
  field: string,
  value: string,
  fields?: string[]
) {
  try {
    /**
     * Implement DB-logic to retrieve the values here, placeholder below
     *
     */
    let result: Record<string, any>[] = [];
    result.push({
      email: "somebody@gmail.com",
      password: "$2a$10$rKVzaEJI8uJsbIUbCcMPOu8r57.HJfu4odFFsLqT7ucQt8tWF98mC",
      code: "markon",
      date: Date.now(),
    });
    return result;
  } catch {
    return [];
  }
}

// Searches our database for users account and updates all fields in "update"
// database - the name of the database to search through
// field - the parameter used to search the DB for the account
// value - the value of that parameter
// update - an object with parameter / value pairs
// updateOne - only updates first entry found by default
async function updateValues(
  database: string,
  field: string,
  value: string,
  update: Record<string, any>,
  updateOne = true
) {
  try {
    /**
     * Implement DB-logic to update fields here
     *
     */
    return true;
  } catch {
    return false;
  }
}

// Adds entries to a database
// database - the name of the database we're adding entries to
// entries - an array of entries we are adding
async function addEntries(database: string, ...entries: Record<string, any>[]) {
  try {
    /*
     *  Implement DB-logic to add entries to database
     *
     */
    return true;
  } catch {
    return false;
  }
}

// Removes entries from a database
// database - the name of the database we're removing entries from
// field - the parameter used to search the DB for the account
// value - the value of that parameter
// removeOne - only removes the first entry found by default
async function removeEntries(
  database: string,
  field: string,
  value: string,
  removeOne = true
) {
  try {
    /*
     *  Implement DB-logic to add entries to database
     *
     */
    return true;
  } catch {
    return false;
  }
}

//Attempts to log user in
async function login(req: NextRequest) {
  try {
    const body = await req.json();
    //Checks if email address and password are valid
    if (!emailRegExp.test(body.email) || !passwordRegExp.test(body.password)) {
      return wrongCredentials();
    }
    //Finds the user's account
    const user = await getValues(
      "Accounts",
      "email",
      body.email.toLowerCase(),
      ["email", "password"]
    );
    if (!user) {
      // Here we are doing a fake-out bcrypt so user who submits an inexistent email won't get feedback instantly
      bcrypt.compare(
        body.password,
        "QhU7UmlNS1Cl9ZPQNVUTf9I8hq4Uq9vYHZjSn8YmEVtL5XyG"
      );
      return wrongCredentials();
    }
    //Logs in user if password is correct
    if (await bcrypt.compare(body.password, user.password)) {
      const sessionId = generateString(48);
      await updateValues("Accounts", "email", user.email, {
        sessionId: sessionId,
      });
      const cookieStore = await cookies();
      cookieStore.set({
        name: "sessionId",
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

//Logs the user out
async function logout(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?.value;
    const newSessionId = generateString(48);
    if (sessionId) {
      // Giving their account a new random sessionId
      await updateValues("Accounts", "sessionId", sessionId, {
        sessionId: newSessionId,
      });
    }
    cookieStore.delete("sessionId");
    return success();
  } catch {
    return failure();
  }
}

//Attempts to send a verification email to user
async function sendVerification(req: NextRequest) {
  try {
    //Checking if credentials are valid
    const body = await req.json();
    let errors = {
      email: "",
      password: "",
    };
    if (!emailRegExp.test(body.email)) {
      errors.email = `Invalid email`;
    }
    if (!passwordRegExp.test(body.password)) {
      errors.password = `Make your password stronger`;
    } else if (body.password !== body.verifyPassword) {
      errors.password = `Passwords do not match`;
    }
    const errorFound = Object.values(errors).some(Boolean);
    if (errorFound) {
      return NextResponse.json({
        errors: errors,
      });
    }
    //Checks to see if account already exists
    const duplicateAccount = await getValues("Accounts", "email", body.email);
    //Checks to see if user is requesting too many verification emails
    const spamCheck = await getAllValues("Unverifieds", "email", body.email);
    if (duplicateAccount || spamCheck.length > 5) {
      //Returns a false positive but doesn't send any emails
      return success();
    } else {
      const verificationCode = generateString(32);
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const user = {
        email: body.email.toLowerCase(),
        password: hashedPassword,
        code: verificationCode,
        date: Date.now(),
      };
      await addEntries("Unverifieds", user);
      const transporter = nodemailer.createTransport({
        /*
         *  Add Email Provider Here
         */
      });
      const mailOptions = {
        from: `"Website" <noreply@website.com>`,
        to: body.email,
        subject: "Website Email Verification",
        html: `
        </p> Welcome to Website! Click below to finish creating your account. </p> <br>
        <a href='${process.env.protocol}${process.env.domain}/verify/${verificationCode}'>Verify Email</a></p>
        `,
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          return networkErrorPassword();
        } else {
          return success();
        }
      });
    }
  } catch {
    return networkErrorPassword();
  }
}

// Verifies the user's email and creates their account
async function verifyEmail(req: NextRequest) {
  try {
    const body = await req.json();
    const unverifieds = await getAllValues("Unverifieds", "code", body.code, [
      "email",
      "password",
      "code",
      "date",
    ]);
    if (!unverifieds) {
      return failure();
    }
    // Get the most recent verification code
    unverifieds.sort((a, b) => b.date - a.date);
    const account = unverifieds[0];
    // Verify code matches
    if (account.code === body.code) {
      // Remove old verification codes
      await removeEntries("Unverifieds", "email", account.email, false);
      // Check if account already exists in Accounts collection
      const existingAccount = await getValues(
        "Accounts",
        "email",
        account.email
      );
      if (existingAccount) {
        return failure();
      } else {
        // Create the account
        await addEntries("Accounts", {
          email: account.email,
          password: account.password,
          dateCreated: new Date(),
          // Add additional fields if needed
        });
        return success();
      }
    } else {
      return failure();
    }
  } catch {
    return networkError();
  }
}

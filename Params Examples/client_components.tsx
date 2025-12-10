//Getting params in client components

// params from dynamic routes
const params = useParams();
const productId = params.productId;
const code = params.code;
// or just...
const { productId, code } = useParams();

//Search Params
const searchParams = useSearchParams();
//  website.com/search?a=some%20search&a=other%20stuff&time=recent
const search = searchParams.get("a"); // 'some search'
const allParams = searchParams.getAll(`a`); // ["some search", "some stuff"]
const exists = searchParams.has(`time`); // returns true
const entries = searchParams.entries();
const keys = searchParams.keys();
const values = searchParams.values();
searchParams.forEach((entry) => {});
searchParams.toString();

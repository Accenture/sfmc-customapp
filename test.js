require('dotenv').config();
const Redis = require('ioredis');

// const redisClient = new Redis(
//     'redis://:p2c876e39fbd74d3f63a9e2c557ab2fdd0820bf3beb31d0ed687fd3f90367e5f7@ec2-100-25-126-248.compute-1.amazonaws.com:27999'
// );
console.log(process.env.REDIS_URL);
const redisClient = new Redis(process.env.REDIS_URL);

async function run() {
    try {
        const res = await redisClient.set('foo', 'bar'); // returns promise which resolves to string, "OK"
        console.log(res);
    } catch (ex) {
        console.error('CATCH', ex);
    }
}
run();

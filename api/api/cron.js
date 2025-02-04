"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function handler(req, res) {
    console.log('Received authorization:', req.headers.authorization);
    console.log('Expected authorization:', `Bearer ${process.env.CRON_SECRET}`);
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).end('Unauthorized - Invalid secret');
    }
    res.status(200).end('Hello Cron!');
}
exports.handler = handler;
// Wrapper to add .status() method to native response object
function wrapResponse(res) {
    const wrappedRes = res;
    wrappedRes.status = function (statusCode) {
        this.statusCode = statusCode;
        return this;
    };
    return wrappedRes;
}
// Add local development server
if (require.main === module) {
    const server = http_1.default.createServer((req, res) => {
        const wrappedRes = wrapResponse(res);
        handler(req, wrappedRes);
    });
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        console.log(`Development server running on http://localhost:${port}`);
    });
}
exports.default = handler;
//# sourceMappingURL=cron.js.map
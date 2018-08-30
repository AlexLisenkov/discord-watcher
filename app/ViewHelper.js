"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_twig_1 = require("node-twig");
class ViewHelper {
    static view(file) {
        return `${__dirname}/../src/views/${file}.twig`;
    }
    static renderFile(file, options = {}) {
        const view = this.view(file);
        return new Promise((resolve, reject) => {
            options = {
                context: options
            };
            node_twig_1.renderFile(view, options, (error, template) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve('data:text/html,' + template);
                }
            });
        });
    }
}
exports.default = ViewHelper;
//# sourceMappingURL=ViewHelper.js.map
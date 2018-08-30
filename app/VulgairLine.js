"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class VulgairLine {
    constructor(html, message) {
        this.html = html;
        console.log(html.innerHTML);
    }
    onDelete() {
        console.log('Verwijderen');
        this.message.delete();
    }
}
exports.default = VulgairLine;
//# sourceMappingURL=VulgairLine.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blacklist = require('./blacklist.json');
class ProfanityFilter {
    static listToPattern(list) {
        function escapeRegexChars(word) { return word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); }
        return '(' + list.map(escapeRegexChars).join('|') + ')';
    }
    static getListRegex() {
        let pattern = this.listToPattern(blacklist);
        pattern = '\\b' + pattern + '\\b';
        return new RegExp(pattern, 'gi');
    }
    static check(target) {
        let regex = this.getListRegex();
        return target.match(regex) || [];
    }
}
exports.default = ProfanityFilter;
//# sourceMappingURL=ProfanityFilter.js.map
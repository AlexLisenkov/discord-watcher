const blacklist = require('./blacklist.json');

export default class ProfanityFilter {

    private static listToPattern(list) :string {
        // we want to treat all characters in the word as literals, not as regex specials (e.g. shi+)
        function escapeRegexChars(word) { return word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); }
    
        return '(' + list.map(escapeRegexChars).join('|') + ')';
    }

    private static getListRegex() {
        let pattern = this.listToPattern(blacklist);
        pattern = '\\b' + pattern + '\\b';

        return new RegExp(pattern, 'gi');
    }

    public static check(target: string) {
        let regex = this.getListRegex();

        return target.match(regex) || [];
    }
}


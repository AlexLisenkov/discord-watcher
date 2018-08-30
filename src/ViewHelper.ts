import {renderFile} from 'node-twig';

export default class ViewHelper {
    public static view(file: string): string {
        return `${__dirname}/../src/views/${file}.twig`;
    }

    public static renderFile(file: string, options: object = {}): Promise<string> {
        const view = this.view(file);

        return new Promise((resolve, reject) => {
            options = {
                context: options
            };
            renderFile(view, options, (error, template) => {
                if (error) {
                    reject(error);
                } else {
                    resolve('data:text/html,'+template);
                }
            });

        });
    }
}

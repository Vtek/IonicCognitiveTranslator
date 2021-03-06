import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from "@angular/http";
import { Language } from "./language";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';

@Injectable()
export class TranslatorService {
    private readonly tokenUrl: string = 'https://api.cognitive.microsoft.com';
    private readonly languageUrl: string = 'https://dev.microsofttranslator.com';
    private readonly translateUrl: string = 'https://api.microsofttranslator.com';

    constructor(private http: Http) { }

    getToken(): Observable<string> {
        let headers = new Headers();
        headers.set('Ocp-Apim-Subscription-Key', '46e77edeaebb4f73b8305e7d835d077b');
        return this.http
            .post(`${this.tokenUrl}/sts/v1.0/issueToken`, {}, { headers: headers })
            .map((rep) => rep.text());
    }

    getLanguages(): Observable<Array<Language>> {
        let headers = new Headers();
        headers.set('Accept-Language', 'en');
        return this.http
            .get(`${this.languageUrl}/languages?api-version=1.0&scope=text`, { headers: headers })
            .map(res => res.json().text)
            .map(languages => this.parse(languages));
    }

    getTranslation(token: string, from: Language, to: Language, text: string): Observable<string> {
        let headers = new Headers();
        let bearerToken = `Bearer ${token}`;
        headers.append('Authorization', bearerToken);

        let options = new RequestOptions({ headers: headers });

        return this.http
            .get(`${this.translateUrl}/V2/Http.svc/Translate?from=${from.code}&to=${to.code}&text=${text}`, options)
            .map(res => this.parseTranslationFromXml(res.text()));
    }

    private parse(languages: any): Array<Language> {
        let array = new Array<Language>();
        for (let code in languages) {
            let language = languages[code];
            array.push({ code: code, name: language.name });
        }

        return array.sort((language1: Language, language2: Language) => {
            if (language1.name > language2.name)
                return 1;
            else if (language1.name < language2.name)
                return -1;
            return 0;
        });
    }

    private parseTranslationFromXml(xml: string): string {
        let parser = new DOMParser();
        let doc = parser.parseFromString(xml, 'application/xml');
        return doc.documentElement.innerHTML;
    }
}
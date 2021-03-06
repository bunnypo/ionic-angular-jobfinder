import { Injectable} from '@angular/core';
import { Http, Response } from '@angular/http';
import { Config } from '../provider/config';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

@Injectable()

export class Auth {
    constructor(public http: Http, public config:Config) {
        
    }

    login(item, user_type) {
        let url = this.config.getAPIURL();
        url = `${url}/${user_type}/signin.php`;
        item = this.config.getFormData(item);
        return this.http.post(url, item).map((response:Response)=>
            response.json());
    }

    signup(item, user_type) {
        let url = this.config.getAPIURL();
        url = `${url}/${user_type}/signup.php`;
        item = this.config.getFormData(item);
        return this.http.post(url, item).map((response:Response)=>
            response.json());
    }
    
    verify(item, user_type) {
        let url = this.config.getAPIURL();
        url = `${url}/${user_type}/verifycode.php`;
        item = this.config.getFormData(item);
        return this.http.post(url, item).map((response:Response)=>
            response.json());
    }
    
    reverify(item, user_type) {
        let url = this.config.getAPIURL();
        url = `${url}/${user_type}/verifycodesend.php`;
        item = this.config.getFormData(item);
        return this.http.post(url, item).map((response:Response)=>
            response.json());
    }
    
    reset(item) {
        let url = this.config.getAPIURL();
        url = `${url}/admin/api/resetpassword.php`;
        item = this.config.getFormData(item);
        return this.http.post(url, item).map((response:Response)=>
            response.json());
    }
}
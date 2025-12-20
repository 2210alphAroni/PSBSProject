import { environment } from "../environments/environments";

function createUrl(subUrl:any){
    return environment.apiUrl + subUrl;
}
export {createUrl}
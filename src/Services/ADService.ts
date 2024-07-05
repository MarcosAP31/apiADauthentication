export interface ADService{
    login(authCodeUrlParameters:any):Promise<any>;
    redirect(tokenRequest:any):Promise<any>;
}
export function GoHome() {
    document.querySelector(".go-home").click();
}

export function GetUserInfo() {
    if (localStorage.getItem("customerInfo"))
        return JSON.parse(localStorage.getItem("customerInfo"));
    else if (sessionStorage.getItem("customerInfo"))
        return JSON.parse(sessionStorage.getItem("customerInfo"));

    return {
        _id: null,
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        address: "",
        gender: "",
        phone: "",
        createdAt: "",
        updatedAt: "",
    };
}

export function ResetLocalStorage() {
    localStorage.removeItem("customerInfo");
    localStorage.removeItem("token");
    sessionStorage.removeItem("customerInfo");
    sessionStorage.removeItem("token");
}

export function StoreDataAtLocalStorage(Type = "localStorage", data) {

    if (Type === "localStorage") {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('customerInfo', JSON.stringify(data.userInfo));

    } else if (Type === "sessionStorage") {
        sessionStorage.setItem('token', data.accessToken);
        sessionStorage.setItem('customerInfo', JSON.stringify(data.userInfo));
    }

}

export function IsUserLoggedIn() {

    if ((localStorage.getItem("customerInfo") && localStorage.getItem("token"))
        || (sessionStorage.getItem("customerInfo") && sessionStorage.getItem("token")))
        return true;
    else
        return false;
}



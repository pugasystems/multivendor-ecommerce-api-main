export const base64Tester = (base64String: string) => {
    const base64Regex = /^data:image\/(png|jpg|jpeg|gif);base64,([A-Za-z0-9+/]+={0,2})$/;
    return base64Regex.test(base64String);
}
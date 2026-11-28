// Stub for firebase/messaging: push messaging is off inside designs.
export const getMessaging = () => null;
export const getToken = async () => null;
export const deleteToken = async () => true;
export const onMessage = () => () => {};
export const isSupported = async () => false;

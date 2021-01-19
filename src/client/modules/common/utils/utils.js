export function getCookieByName(name) {
    try {
        return document.cookie
            .split(';')
            .find((row) => row.startsWith(name))
            .split('=')[1];
    } catch (ex) {
        this.dispatchEvent(
            new CustomEvent('error', {
                bubbles: true,
                composed: true,
                detail: {
                    type: 'error',
                    message: 'Issues with the session, try refreshing the page'
                }
            })
        );
        this.isLoading = false;
        throw ex;
    }
}

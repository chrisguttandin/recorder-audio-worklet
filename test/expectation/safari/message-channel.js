describe('MessageChannel', () => {

    // Bug #1 https://bugs.webkit.org/show_bug.cgi?id=184254

    it('should not support to send a transferable object', (done) => {
        const arrayBuffer = new ArrayBuffer(0);
        const { port1, port2 } = new MessageChannel();

        port1.onmessage = ({ data }) => {
            expect(data).to.be.null;

            done();
        };
        port2.postMessage(arrayBuffer, [ arrayBuffer ]);
    });

});

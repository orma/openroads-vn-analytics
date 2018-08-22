class ORFrameNotifier {
  constructor (id, receiver, sender = window) {
    this.events = {};
    this.id = id;
    this.sender = sender;
    this.receiver = receiver;

    this._messageListener = this._messageListener.bind(this);
    this.sender.addEventListener('message', this._messageListener);
  }

  _messageListener (e) {
    if (!e.data.type) return;
    var cbs = this.events[e.data.type] || [];
    cbs.forEach(function (cb) { cb(e.data); });
  }

  on (type, cb) {
    if (!this.events[type]) this.events[type] = [];
    this.events[type].push(cb);
    return this;
  }

  send (type, data) {
    data = data || {};
    data.id = this.id;
    data.type = type;
    this.receiver.postMessage(data, '*');
    return this;
  }

  destroy () {
    this.sender.removeEventListener('message', this._messageListener);
    this.events = {};
  }
}

if (typeof module !== 'undefined') {
  module.exports = ORFrameNotifier;
}

/*
<script src='//localhost:3000/OR_frame_notifier.js'></script>
<script>
    if (window === window.parent) {
        console.warn('Not inside an iframe. ORFrameNotifier won\'t be initialized.');
    } else {
        const orFrame = new ORFrameNotifier('id', window.parent);
        orFrame
        .send('loaded')
        .on('settings', data => {
            console.log('Settings received. Init');
        });
    }
</script>
 */

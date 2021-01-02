/**
An emitter implementation based on the Node.js EventEmitter API:
https://nodejs.org/dist/latest-v6.x/docs/events.html#events_class_eventemitter
**/
export class EventEmitter {
    constructor() {
        this.registry = {};
    }

    /**
    Registers a listener on the emitter
    @method EventEmitter#on
    @param {String} name - The name of the event
    @param {Function} listener - The callback function
    @return {EventEmitter} - Returns a reference to the `EventEmitter` so that calls can be chained
    **/
    on(name, listener) {
        this.registry[name] = this.registry[name] || [];
        this.registry[name].push(listener);
        return this;
    }

    /**
    Registers a listener on the emitter that only executes once
    @method EventEmitter#once
    @param {String} name - The name of the event
    @param {Function} listener - The callback function
    @return {EventEmitter} - Returns a reference to the `EventEmitter` so that calls can be chained
    **/
    once(name, listener) {
        const doOnce = function () {
            listener.apply(null, arguments);
            this.removeListener(name, doOnce);
        }.bind(this);
        this.on(name, doOnce);
        return this;
    }

    /**
    Synchronously calls each listener registered with the specified event
    @method EventEmitter#emit
    @param {String} name - The name of the event
    @return {Boolean} - Returns `true` if the event had listeners, `false` otherwise
    **/
    emit(name) {
        const args = Array.prototype.slice.call(arguments, 1);
        const listeners = this.registry[name];
        let count = 0;

        if (listeners) {
            listeners.forEach((listener) => {
                count += 1;
                listener.apply(null, args);
            });
        }
        return count > 0;
    }

    /**
    Removes the specified `listener` from the listener array for the event named `name`
    @method EventEmitter#removeListener
    @param {String} name - The name of the event
    @param {Function} listener - The callback function
    @return {EventEmitter} - Returns a reference to the `EventEmitter` so that calls can be chained
    **/
    removeListener(name, listener) {
        const listeners = this.registry[name];
        if (listeners) {
            for (let i = 0, len = listeners.length; i < len; i += 1) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                    return this;
                }
            }
        }
        return this;
    }
}

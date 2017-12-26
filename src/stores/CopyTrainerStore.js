import { action, extendObservable } from "mobx";

class CopyTrainerStore {
  constructor(rootStore, transport) {
    this.rootStore = rootStore;
    this.transport = transport;

    extendObservable(this, {
      minLength: 2,
      maxLength: 3,

      setMinLength: action(l => {
        var n = parseInt(l, 10);
        if (isNaN(n)) {
          n = 0;
        }
        this.minLength = n;
        if (this.minLength > this.maxLength) {
          this.maxLength = this.minLength;
        }
      }),
      setMaxLength: action(l => {
        var n = parseInt(l, 10);
        if (isNaN(n)) {
          n = 0;
        }
        this.maxLength = n;
        if (this.maxLength < this.minLength) {
          this.minLength = this.maxLength;
        }
      })
    });
  }
}

export default CopyTrainerStore;

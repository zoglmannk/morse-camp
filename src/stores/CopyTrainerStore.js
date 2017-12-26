import { action, autorun, extendObservable, observable, reaction } from "mobx";

class CopyTrainerStore {
  constructor(rootStore, transport, noDebounce) {
    this.rootStore = rootStore;
    this.transport = transport;

    extendObservable(this, {
      minLength: 2,
      maxLength: 3,
      words: observable.map(),

      get asJson() {
        return {
          minLength: this.minLength,
          maxLength: this.maxLength
        };
      }
    });

    this.loadSettings = this.transport
      .loadSettings("copyTrainer")
      .then(json => {
        if (json) {
          this.setMinLength(json.minLength);
          this.setMaxLength(json.maxLength);
        }
      });

    this.loadWords = this.transport.iterateWords((w, s) =>
      this.setWordScore(w, s)
    );

    var opts = {};
    if (!noDebounce) {
      opts.delay = 500;
    }

    this.saveHandler = reaction(
      () => this.asJson,
      json => this.transport.saveSettings("copyTrainer", json),
      opts
    );

    this.wordPersister = autorun(() => {
      for (const [k, v] of this.words.entries()) {
        this.transport.setIfDifferent(k, v);
      }
    });
  }

  setWordScore = action((w, score) => {
    this.words.set(w, score);
  });

  setMinLength = action(l => {
    var n = parseInt(l, 10);
    if (isNaN(n)) {
      n = 0;
    }
    this.minLength = n;
    if (this.minLength > this.maxLength) {
      this.maxLength = this.minLength;
    }
  });

  setMaxLength = action(l => {
    var n = parseInt(l, 10);
    if (isNaN(n)) {
      n = 0;
    }
    this.maxLength = n;
    if (this.maxLength < this.minLength) {
      this.minLength = this.maxLength;
    }
  });

  wordFeedback = action((word, success, count) => {
    this.setWordScore(word, success / count);
  });

  textFeedback = action((text, success, count) => {
    const words = text.split(" ");
    words.forEach(w => this.wordFeedback(w, success, count));
  });
}

export default CopyTrainerStore;

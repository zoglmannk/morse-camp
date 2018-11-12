import React, { PureComponent } from "react";
import { Button, DialogContainer, FontIcon, Slider } from "react-md";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";

import { makeLogger } from "./analytics";
import TestButton from "./TestButton";

const event = makeLogger("Settings");

const ClearStorage = inject("store")(
  class ClearStorage extends PureComponent {
    state = {
      visible: false,
      pageX: null,
      pageY: null
    };

    show = e => {
      let { pageX, pageY } = e;
      if (e.changedTouches) {
        pageX = e.changedTouches[0].pageX;
        pageY = e.changedTouches[0].pageY;
      }

      this.setState({ visible: true, pageX, pageY });
    };

    hide = () => {
      this.setState({ visible: false });
    };

    delete = () => {
      event("clear storage");
      const { store } = this.props;
      store.transport.clear().then(() => {
        store.morse.setupActiveDictionary();
        store.appStore.addToast("Storage cleared");
        window.location.reload();
      });

      this.hide();
    };

    render() {
      const { visible, pageX, pageY } = this.state;
      const actions = [
        {
          onClick: this.hide,
          primary: true,
          children: "No, nevermind"
        },
        {
          onClick: this.delete,
          primary: false,
          children: "Yes, delete everything"
        }
      ];

      return (
        <div>
          <Button
            raised
            onClick={this.show}
            aria-controls="clear-storage-dialog"
            iconEl={<FontIcon>delete</FontIcon>}
          >
            Clear storage
          </Button>
          <DialogContainer
            id="clear-storage-dialog"
            visible={visible}
            pageX={pageX}
            pageY={pageY}
            modal
            onHide={this.hide}
            aria-labelledby="clear-storage-title"
            actions={actions}
          >
            <p>Reset all settings and progress data?</p>
          </DialogContainer>
        </div>
      );
    }
  }
);

const Settings = inject("store", "morsePlayer")(
  observer(({ store, morsePlayer }) => (
    <div>
      <Helmet>
        <title>Settings</title>
      </Helmet>
      <h1>Settings</h1>
      <div>
        <h2>Morse player</h2>
        <div>
          <Slider
            id="speed"
            label="Character Speed (WPM)"
            editable
            max={80}
            min={10}
            value={store.morse.characterSpeed}
            onChange={value => {
              store.morse.setCharacterSpeed(value);
              store.morse.setEffectiveSpeed(value);
            }}
            leftIcon={<FontIcon>fast_forward</FontIcon>}
          />
          <Slider
            id="speed"
            label="Effective Speed (WPM)"
            editable
            max={store.morse.characterSpeed}
            min={10}
            value={store.morse.effectiveSpeed}
            onChange={value => store.morse.setEffectiveSpeed(value)}
            leftIcon={<FontIcon>fast_forward</FontIcon>}
          />
          <Slider
            id="frequency"
            label="Tone Frequency (Hz)"
            editable
            max={1000}
            min={200}
            step={10}
            value={store.morse.frequency}
            onChange={value => store.morse.setFrequency(value)}
            leftIcon={<FontIcon>audiotrack</FontIcon>}
          />
          <Slider
            id="volume"
            label="Volume (%)"
            editable
            max={100}
            min={0}
            value={store.morse.volume}
            onChange={value => store.morse.setVolume(value)}
            leftIcon={<FontIcon>build</FontIcon>}
          />
          <TestButton repeatCount={1} />
        </div>
        <br />
        <br />
        <h2>Internals</h2>
        <div>
          <ClearStorage />
        </div>
      </div>
    </div>
  ))
);

export default Settings;

import React, { PureComponent, Component } from "react";
import {
  Button,
  DialogContainer,
  FontIcon,
  Slider,
  List,
  Checkbox,
  ListItemControl
} from "react-md";
import { inject, observer } from "mobx-react";
import { Helmet } from "react-helmet";
import { dictionary } from "./Words";

import { makeLogger } from "./analytics";

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
        store.appStore.addToast("Storage cleared");
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

const TestButton = inject("store", "morsePlayer")(
  class TestButton extends Component {
    playCount = 0;
    playInterval;

    playLoop = () => {
      if (!this.props.store.morse.playing) {
        if (this.playCount === 0) {
          this.playCount++;
          this.playHello();
        } else if (this.playCount > 1) {
          clearInterval(this.playInterval);
          this.playInterval = undefined;
        } else {
          this.playCount++;
          setTimeout(() => {
            this.playHello();
          }, this.props.store.morse.delay);
        }
      }
    };

    playHello = () => {
      this.props.morsePlayer.playString("hello");
    };

    render() {
      return (
        <Button
          raised
          primary
          className="md-block-centered"
          iconEl={<FontIcon>play_arrow</FontIcon>}
          onClick={() => {
            event("test");
            if (this.playInterval === undefined) {
              this.playCount = 0;
              this.playInterval = setInterval(this.playLoop, 50);
            }
          }}
        >
          Test
        </Button>
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
        <br />
        <h2>Morse tone</h2>
        <div>
          <Slider
            id="speed"
            label="Speed (WPM)"
            editable
            max={80}
            min={10}
            value={store.morse.speed}
            onChange={value => store.morse.setSpeed(value)}
            leftIcon={<FontIcon>fast_forward</FontIcon>}
          />
          <Slider
            id="frequency"
            label="Frequency (Hz)"
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
            label="Voume"
            editable
            max={100}
            min={0}
            value={store.morse.volume}
            onChange={value => store.morse.setVolume(value)}
            leftIcon={<FontIcon>build</FontIcon>}
          />
        </div>
        <br />
        <br />
        <div>
          <h2>Read Trainer</h2>
          <Slider
            id="delay"
            label="Delay Before Repeat (ms)"
            editable
            max={5000}
            min={10}
            step={10}
            value={store.morse.delay}
            onChange={value => store.morse.setDelay(value)}
            leftIcon={<FontIcon>build</FontIcon>}
          />
          <Slider
            id="max repeats"
            label="Max Repeats"
            editable
            max={20}
            min={1}
            step={1}
            value={store.morse.maxRepeats}
            onChange={value => store.morse.setMaxRepeats(value)}
            leftIcon={<FontIcon>build</FontIcon>}
          />
          <Slider
            id="activeDictionarySize"
            label="Dictionary Size"
            editable
            max={dictionary.wordFrequency.size}
            min={1}
            step={1}
            value={store.morse.activeDictionarySize}
            onChange={value => store.morse.setActiveDictionarySize(value)}
            leftIcon={<FontIcon>build</FontIcon>}
          />
          <h4>Dictionary Options</h4>
          <List className={"md-cell md-cell--10 md-paper md-paper--2"}>
            <ListItemControl
              primaryAction={
                <Checkbox
                  id="list-control-primary-1"
                  name="list-control-primary"
                  label="Words"
                  checked={store.morse.includeWords}
                  onChange={value => {
                    if (value) {
                      dictionary.addType("Word");
                    } else {
                      dictionary.removeType("Word");
                    }
                    store.morse.setActiveDictionarySize(
                      dictionary.wordFrequency.size
                    );
                    store.morse.setIncludeWords(value);
                  }}
                />
              }
            />
            <ListItemControl
              primaryAction={
                <Checkbox
                  id="list-control-primary-2"
                  name="list-control-primary"
                  label="Abbreviations"
                  checked={store.morse.includeAbbreviations}
                  onChange={value => {
                    if (value) {
                      dictionary.addType("Abbreviation");
                    } else {
                      dictionary.removeType("Abbreviation");
                    }
                    store.morse.setActiveDictionarySize(
                      dictionary.wordFrequency.size
                    );
                    store.morse.setIncludeAbbreviations(value);
                  }}
                />
              }
            />
            <ListItemControl
              primaryAction={
                <Checkbox
                  id="list-control-primary-3"
                  name="list-control-primary"
                  label="Q Codes"
                  checked={store.morse.includeQCodes}
                  onChange={value => {
                    if (value) {
                      dictionary.addType("Q Code");
                    } else {
                      dictionary.removeType("Q Code");
                    }
                    store.morse.setActiveDictionarySize(
                      dictionary.wordFrequency.size
                    );
                    store.morse.setIncludeQCodes(value);
                  }}
                />
              }
            />
            <ListItemControl
              primaryAction={
                <Checkbox
                  id="list-control-primary-4"
                  name="list-control-primary"
                  label="Numbers"
                  checked={store.morse.includeNumbers}
                  onChange={value => {
                    if (value) {
                      dictionary.addType("Number");
                    } else {
                      dictionary.removeType("Number");
                    }
                    store.morse.setActiveDictionarySize(
                      dictionary.wordFrequency.size
                    );
                    store.morse.setIncludeNumbers(value);
                  }}
                />
              }
            />
            <ListItemControl
              primaryAction={
                <Checkbox
                  id="list-control-primary-5"
                  name="list-control-primary"
                  label="Years"
                  checked={store.morse.includeYears}
                  onChange={value => {
                    if (value) {
                      dictionary.addType("Year");
                    } else {
                      dictionary.removeType("Year");
                    }
                    store.morse.setActiveDictionarySize(
                      dictionary.wordFrequency.size
                    );
                    store.morse.setIncludeYears(value);
                  }}
                />
              }
            />
            <ListItemControl
              primaryAction={
                <Checkbox
                  id="list-control-primary-6"
                  name="list-control-primary"
                  label="US Names"
                  checked={store.morse.includeUSNames}
                  onChange={value => {
                    if (value) {
                      dictionary.addType("US Name");
                    } else {
                      dictionary.removeType("US Name");
                    }
                    store.morse.setActiveDictionarySize(
                      dictionary.wordFrequency.size
                    );
                    store.morse.setIncludeUSNames(value);
                  }}
                />
              }
            />
            <ListItemControl
              primaryAction={
                <Checkbox
                  id="list-control-primary-7"
                  name="list-control-primary"
                  label="US State Abbreviations"
                  checked={store.morse.includeUSStateAbbreviations}
                  onChange={value => {
                    if (value) {
                      dictionary.addType("US State Abbreviation");
                    } else {
                      dictionary.removeType("US State Abbreviation");
                    }
                    store.morse.setActiveDictionarySize(
                      dictionary.wordFrequency.size
                    );
                    store.morse.setIncludeUSStateAbbreviations(value);
                  }}
                />
              }
            />
            <ListItemControl
              primaryAction={
                <Checkbox
                  id="list-control-primary-8"
                  name="list-control-primary"
                  label="Countries"
                  checked={store.morse.includeCountries}
                  onChange={value => {
                    if (value) {
                      dictionary.addType("Country");
                    } else {
                      dictionary.removeType("Country");
                    }
                    store.morse.setActiveDictionarySize(
                      dictionary.wordFrequency.size
                    );
                    store.morse.setIncludeCountries(value);
                  }}
                />
              }
            />
          </List>
          <br />
          <TestButton />
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

'use babel';

import AtomBuildFpmView from './atom-build-fpm-view';
import { CompositeDisposable } from 'atom';

export default {

  atomBuildFpmView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomBuildFpmView = new AtomBuildFpmView(state.atomBuildFpmViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomBuildFpmView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-build-fpm:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomBuildFpmView.destroy();
  },

  serialize() {
    return {
      atomBuildFpmViewState: this.atomBuildFpmView.serialize()
    };
  },

  toggle() {
    console.log('AtomBuildFpm was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};

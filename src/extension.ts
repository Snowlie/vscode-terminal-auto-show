'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Disposable, window, workspace, Terminal, commands, Selection, TextEdit, TextEditor } from 'vscode';
import { worker } from 'cluster';

let Settings = {
    enable: true,
    forceClose: true, //If the terminal is not the active tab, should the panel be closed anyway? This is helpful when debugging
    nonFileNameViews: ['input']
}

export function activate(context: vscode.ExtensionContext) {
    let autoShow = new TerminalAutoShow();
    let autoShowControl = new TerminalAutoShowController(autoShow);
    //commands.registerCommand('terminalautoshow.Toggle', toggle);
    context.subscriptions.push(autoShow);
    context.subscriptions.push(autoShowControl);
}

function enableForceClose() {
    Settings.forceClose = true;
}

function disableForceClose() {

}

class TerminalAutoShow {
    private _terminal: Terminal;
    private _hidden = false;

    constructor() {
        this._terminal = window.createTerminal();
        this.showTerminal();
    }

    isEditorsEmpty() {
        const editors = window.visibleTextEditors;
        for (let i = 0; i < editors.length; i++) {
            console.log(editors[i]);
            if (!this.isNonFileNameView(editors[i])) {
                return false;
            }
        }
        return true;
    }

    isNonFileNameView(item: TextEditor) {
        console.log(item);
        for (const view in Settings.nonFileNameViews) {
            if (item.document.fileName == Settings.nonFileNameViews[view]) {
                return true;
            }
        }

        return false;
    }

    doucmentClosed() {
        if (this.isEditorsEmpty()) {
            this.showTerminal();
        }
    }

    documentOpened() {
        this.hideTerminal();
    }

    showTerminal() {
        this._terminal.show();
        this._hidden = false;
    }

    hideTerminal() {
        this._terminal.show(); //Have to show it to focus it and then close it
        this._terminal.hide();
        this._hidden = true;
    }

    fullScreenTerminal() {
        this._terminal.show();
    }

    dispose() {
        this._terminal.dispose();
    }
}

class TerminalAutoShowController {
    private _autoShow: TerminalAutoShow;
    private _disposable: Disposable;

    constructor(autoShow: TerminalAutoShow) {
        this._autoShow = autoShow;

        let subscriptions: Disposable[] = [];
        workspace.onDidCloseTextDocument(this._documentClosed, this, subscriptions);
        workspace.onDidOpenTextDocument(this._documentOpened, this, subscriptions);

        this._disposable = Disposable.from(...subscriptions);
    }

    _documentClosed() {
        this._autoShow.doucmentClosed();
    }

    _documentOpened() {
        this._autoShow.documentOpened();
    }

    dispose() {
        this._disposable.dispose();
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}
'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Disposable } from 'vscode';
import { window } from 'vscode';
import { workspace } from 'vscode';
import { Terminal } from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "terminalautoshow" is now active!');

    let autoShow = new TerminalAutoShow();
    let autoShowControl = new TerminalAutoShowController(autoShow);

    context.subscriptions.push(autoShow);
    context.subscriptions.push(autoShowControl);
}

class TerminalAutoShow {
    private _terminal: Terminal;
    private _hidden = false;

    constructor() {
        this._terminal = window.createTerminal();
        this.showTerminal();
    }

    doucmentClosed() {
        if (window.visibleTextEditors.length <= 0) {
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
/* eslint-env browser */

import * as Y from 'yjs'
import { WebxdcProvider } from 'y-webxdc';
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from 'y-prosemirror'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { schema } from './schema.js'
import { exampleSetup } from 'prosemirror-example-setup'
import { keymap } from 'prosemirror-keymap'

const webxdc = window.webxdc;

window.addEventListener('load', () => {
  const ydoc = new Y.Doc()

  const provider = new WebxdcProvider({
    webxdc: webxdc, 
    ydoc: ydoc, 
    autosaveInterval: 10*1000,
    getEditInfo: () => {
      const document = getFirstLine(editorView.state);
      const summary = `Last edit: ${webxdc.selfName}`;
      const startinfo = `${webxdc.selfName} editing ${document}`;
      return {document, summary, startinfo}; 
    },
  });

  const yXmlFragment = ydoc.getXmlFragment('prosemirror')

  const editor = document.createElement('div')
  editor.setAttribute('id', 'editor')
  const editorContainer = document.createElement('div')
  editorContainer.insertBefore(editor, null)
  const prosemirrorView = new EditorView(editor, {
    state: EditorState.create({
      schema,
      plugins: [
        ySyncPlugin(yXmlFragment),
        yCursorPlugin(provider.awareness),
        yUndoPlugin(),
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo
        })
      ].concat(exampleSetup({ schema }))
    })
  })
  document.body.insertBefore(editorContainer, null)

  // @ts-ignore
  window.example = { provider, ydoc, yXmlFragment, prosemirrorView }
})

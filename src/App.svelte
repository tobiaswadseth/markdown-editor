<script>
	import Editor from './Editor.svelte'
	import Preview from './Preview.svelte'

	let markdown = ''
	let fileContent

	let activeFilePath

	const { ipcRenderer, BrowserWindow } = require('electron')

	ipcRenderer.on('savefile', (e) => {
		if (activeFilePath) {
			ipcRenderer.send('saveexistingfile', {
				path: activeFilePath,
				content: markdown
			})
		} else {
			ipcRenderer.send('savenewfile', markdown)
		}
	})

	// TODO: Fix the unsaved changes for saveexistingfile
	ipcRenderer.on('update', (e, { content }) => {
		fileContent = content
	})
	
	ipcRenderer.on('fileopened', (e, { path, content }) => {
		activeFilePath = path
		markdown = content
		fileContent = content
		unsavedChanges = false
	})

	$: unsavedChanges = !(fileContent === markdown)
	let lastState = true
	$: if (unsavedChanges === lastState) {
		const { port1, port2 } = new MessageChannel()
		ipcRenderer.postMessage('unsavedchanges-reply', { state: unsavedChanges }, [port1])
		lastState = !lastState
	}
</script>

<style>
	main {
		display: flex;
		flex-direction: column;
	}

	.file-path {
		font-weight: bold;
	}

	.editor-and-preview {
		display: flex;
		flex-direction: row;
	}
</style>

<main>
	<p class="file-path">
		{activeFilePath ? activeFilePath.split('/')[activeFilePath.split('/').length - 1] : "Untitled File"}{unsavedChanges ? '*' : ''}
	</p>
	<p class="editor-and-preview">
		<Editor bind:markdown />
		<Preview {markdown} />
	</p>
</main>
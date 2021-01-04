<script>
	import Editor from './Editor.svelte'
	import Preview from './Preview.svelte'

	let markdown = ''

	let activeFilePath

	const { ipcRenderer } = require('electron')

	ipcRenderer.on('savefile', () => {
		// Save file
	})
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
		{activeFilePath ? activeFilePath : "Press 'Save' or hit 'CTRL + S' to save"}
	</p>
	<p class="editor-and-preview">
		<Editor bind:markdown />
		<Preview {markdown} />
	</p>
</main>
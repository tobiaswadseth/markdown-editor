<script>
    import marked from 'marked'
    import dompurify from 'dompurify'
    export let markdown = ''
</script>

<style>
    section {
        width: 100%;
        min-height: 95vh;
        margin-left: 0.5rem;
        padding: 0.2rem;
        flex: 2;
        background-color: #F5F5F5;
    }

    section :global(*) {
        word-break: break-word;
        white-space: pre-wrap;
    }
</style>

<section>
    {@html marked(dompurify.sanitize(markdown))}
</section>
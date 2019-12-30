<template>
	<div class="comments">
		<div class="comment" v-for="(comment, index) in comments" v-bind:key="index">
			{{ comment.comment }}
		</div>
	</div>
</template>

<script>
export default {
  props: ['comments']
}
</script>

<style lang="scss">
.comment {
  margin: 1em 0 0;
}
</style>
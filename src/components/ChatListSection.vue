<template>
  <div>
    <ChatList
      v-if="showChatList"
      :chats="chats"
      filter-enabled
      :title-enabled="false"
      @select="$emit('select-chat', $event)"
      @expand="$emit('expand-chat', $event)"
      @action="$emit('chat-action', $event)"
      @load-more-chats="$emit('load-more-chats')"
    >
      <template #actions><h2>Чаты</h2></template>
    </ChatList>

    <FeedSearch
      v-if="showFeedSearch"
      @search="$emit('search', $event)"
      @cancel="$emit('cancel-search')"
    />

    <FeedFoundObjects
      v-if="showFoundObjects"
      :not-found="notFound"
      :objects="foundMessages"
      :found-amount="foundMessages.length"
      @clicked-search="$emit('clicked-search', $event)"
    />
  </div>
</template>

<script setup>
import {computed} from "vue";
import { ChatList, FeedSearch, FeedFoundObjects } from "@mobilon-dev/chotto";
const props = defineProps({
  chats: Array,
  isOpenSearch: Boolean,
  feedSearchFeedCol: Boolean,
  foundMessages: Array,
});
const emits = defineEmits(["select-chat", "expand-chat", "chat-action", "load-more-chats", "search", "cancel-search", "clicked-search"]);

const showChatList = computed(() => !props.isOpenSearch || props.feedSearchFeedCol);
const showFeedSearch = computed(() => props.isOpenSearch && !props.feedSearchFeedCol);
const showFoundObjects = computed(() => props.isOpenSearch && !props.feedSearchFeedCol && props.foundMessages.length > 0);
const notFound = computed(() => props.foundMessages.length === 0);
</script>

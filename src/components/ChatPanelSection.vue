<template>
  <ChatWrapper :is-open-chat-panel="isOpenChatPanel" :is-selected-chat="!!selectedChat" :chat-panel-width="chatPanelWidth">
    <template #default>
      <div class="feed-location">
        <ChatInfo
          :chat="selectedChat"
          :show-return-button="isShowReturnButton"
          :description="selectedDialog?.name"
          @return-to-chats="$emit('return-to-chats')"
        >
          <template #actions>
            <div class="chat-info__buttons">
              <button @click="$emit('toggle-chat-panel')"><span class="pi pi-info-circle"/></button>
              <button @click="$emit('toggle-search-panel')"><span class="pi pi-search"/></button>
            </div>
          </template>
        </ChatInfo>

        <FeedSearch v-if="showFeedSearchInThirdCol" @search="$emit('search', $event)" @cancel="$emit('cancel-search')" />
        <FeedFoundObjects v-if="showFoundObjectsInThirdCol" :not-found="foundMessages.length === 0" :objects="foundMessages" @clicked-search="$emit('clicked-search', $event)" />

        <Feed
          v-if="showFeed"
          :objects="messages"
          :typing="selectedChat?.typing ? { avatar: selectedChat.avatar, title: selectedChat.title } : false"
          :scroll-to-bottom="true"
          @message-action="$emit('message-action', $event)"
          @load-more="$emit('load-more')"
        />

        <ChatInput :focus-on-input-area="inputFocus">
          <template #inline-buttons>
            <ButtonCommandsSelector :mode="'hover'" :commands="commands" @send="$emit('add-message', $event)" />
            <FileUploader :filebump-url="filebumpUrl" />
            <ButtonEmojiPicker :mode="'hover'" />
            <ButtonTemplateSelector :templates="templates" :group-templates="groupTemplates" />
          </template>
        </ChatInput>
      </div>
    </template>

    <template #placeholder>
      <SplashScreen>
        <template #title><h3>Привет!</h3></template>
        <template #text>Выберите чат и диалог из списка слева</template>
      </SplashScreen>
    </template>

    <template #chatpanel>
      <ChatPanel v-if="isOpenChatPanel">
        <template #content>
          {{ selectedChat?.name }}
          <button class="button-close" @click="$emit('toggle-chat-panel')"><span class="pi pi-times"/></button>
        </template>
      </ChatPanel>
    </template>
  </ChatWrapper>
</template>

<script setup>
import {computed} from "vue";
import { ChatPanel, FeedSearch, FeedFoundObjects, SplashScreen, ChatWrapper, ChatInput,
  ButtonCommandsSelector, FileUploader, ButtonEmojiPicker, ButtonTemplateSelector,
  Feed, ChatInfo
} from "@mobilon-dev/chotto";
const props = defineProps({
  selectedChat: Object,
  selectedDialog: Object,
  messages: Array,
  foundMessages: Array,
  isOpenChatPanel: Boolean,
  isOpenSearch: Boolean,
  feedSearchFeedCol: Boolean,
  isShowFeedWhileSearch: Boolean,
  chatPanelWidth: Number,
  inputFocus: Boolean,
  commands: Array,
  templates: Array,
  groupTemplates: Array,
  filebumpUrl: String,
});
const emits = defineEmits([
  "toggle-chat-panel", "toggle-search-panel", "search", "cancel-search",
  "clicked-search", "message-action", "load-more", "add-message", "return-to-chats"
]);

const showFeedSearchInThirdCol = computed(() => props.isOpenSearch && props.feedSearchFeedCol);
const showFoundObjectsInThirdCol = computed(() => props.isOpenSearch && props.feedSearchFeedCol && !props.isShowFeedWhileSearch);
const showFeed = computed(() => props.isShowFeedWhileSearch || !props.feedSearchFeedCol);
const isShowReturnButton = computed(() => props.chatPanelWidth < 920);
</script>

<style scoped>
.feed-location {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-info__buttons {
  display: flex;
}
</style>

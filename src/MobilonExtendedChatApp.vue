<template>
  <BaseContainer ref="refContainer" height="90vh" width="90vw">
    <ExtendedLayout>
      <!-- First Column: Sidebar + Theme -->
      <template #first-col>
        <SideBar :sidebar-items="sidebarItems" @select-item="selectItem" />
        <ThemeMode :themes="themes" :show="true" @selected-theme="setTheme" />
      </template>

      <!-- Second Column: Chat List / Search -->
      <template #second-col>
        <ChatList
          v-if="showChatList"
          ref="refChatList"
          :chats="chatsStore.chats"
          filter-enabled
          :title-enabled="false"
          @select="selectChat"
          @expand="expandChat"
          @action="chatAction"
          @load-more-chats="loadMoreChats"
        >
          <template #actions>
            <h2>Чаты</h2>
          </template>
        </ChatList>

        <FeedSearch
          v-if="showFeedSearch"
          @search="searchMessages"
          @cancel="toggleSearchPanel"
        />

        <FeedFoundObjects
          v-if="showFoundObjects"
          :not-found="notFoundMessage"
          :objects="foundMessages"
          :found-amount="foundMessages.length"
          @clicked-search="openMessage"
        />
      </template>

      <!-- Third Column: Chat Panel -->
      <template #third-col>
        <ChatWrapper
          ref="refChatWrapper"
          :is-open-chat-panel="isOpenChatPanel"
          :is-selected-chat="!!selectedChat"
          :chat-panel-width="chatPanelWidth"
        >
          <template #default>
            <div id="feed-location" class="feed-location">
              <!-- Chat Info -->
              <ChatInfo
                :chat="selectedChat"
                :show-return-button="isShowReturnButton"
                :default-last-activity-time="true"
                :description="description"
                additional-title="11:06"
                @return-to-chats="handleReturnToChats"
              >
                <template #img-description>
                  <img
                    src="https://img.freepik.com/free-photo/smiley-man-relaxing-outdoors_23-2148739334.jpg"
                    height="16"
                    width="16"
                  />
                </template>

                <template #actions>
                  <div class="chat-info__buttons">
                    <button class="chat-info__button-panel" @click="toggleChatPanel">
                      <span class="pi pi-info-circle" />
                    </button>
                    <button class="chat-info__button-panel" @click="toggleSearchPanel">
                      <span class="pi pi-search" />
                    </button>
                  </div>
                </template>
              </ChatInfo>

              <!-- Search Panel in Feed -->
              <FeedSearch
                v-if="showFeedSearchInThirdCol"
                is-feed-location
                @search="searchMessages"
                @cancel="toggleSearchPanel"
                @switch="isShowFeedWhileSearch = !isShowFeedWhileSearch"
              />

              <FeedFoundObjects
                v-if="showFoundObjectsInThirdCol"
                :not-found="notFoundMessage"
                :objects="foundMessages"
                :found-amount="foundMessages.length"
                @clicked-search="openMessage"
              />

              <!-- Chat Messages -->
              <Feed
                v-if="showFeed"
                :button-params="buttonParams"
                :objects="messages"
                :typing="selectedChat?.typing ? { avatar: selectedChat.avatar, title: selectedChat.title } : false"
                :enable-double-click-reply="true"
                :scroll-to="clickedReply"
                :scroll-to-bottom="scrollToBottomOnSelectChat || isScrollToBottomOnUpdateObjectsEnabled"
                :apply-style="setMessageClass"
                @message-action="messageAction"
                @load-more="loadMore"
                @load-more-down="loadMoreDown"
                @message-visible="messageVisible"
                @click-replied-message="openMessage"
                @force-scroll-to-bottom="forceScrollToBottom"
                @keyboard-action="keyboardAction"
              >
                <template #empty-feed>
                  <SplashScreen>
                    <template #title>
                      <h3>Нет сообщений</h3>
                    </template>
                    <template #text>
                      <span class="empty-feed-text">Вы можете отправить новое сообщение или воспользоваться шаблоном</span>
                    </template>
                    <template #picture>
                      <img
                        src="https://filebump2.services.mobilon.ru/file/J2PDOO0mtcsK2v7J3z6tGJ2ttG1IwtlYnHLU/"
                        width="196"
                        height="196"
                      />
                    </template>
                  </SplashScreen>
                </template>
              </Feed>

              <!-- Chat Input -->
              <ChatInput :focus-on-input-area="inputFocus">
                <template #inline-buttons>
                  <ButtonCommandsSelector :mode="'hover'" :commands="commands" @send="addMessage" />
                  <FileUploader :filebump-url="filebumpUrl" />
                  <ButtonEmojiPicker :mode="'hover'" />
                  <ButtonTemplateSelector :templates="templates" :group-templates="groupTemplates" :mode="'click'" :elevated-window="false" />
                </template>
              </ChatInput>
            </div>
          </template>

          <!-- Placeholder -->
          <template #placeholder>
            <SplashScreen>
              <template #title>
                <h3>Привет!</h3>
              </template>
              <template #text>
                <span>Выберите чат и диалог из списка слева</span>
              </template>
              <template #picture>
                <img
                  src="https://filebump2.services.mobilon.ru/file/kUvCq3FDfVXR5UsJ1rB9Z7eFk23Xy3bqyQEZ"
                  width="196"
                  height="196"
                />
              </template>
            </SplashScreen>
          </template>

          <!-- Chat Panel -->
          <template #chatpanel>
            <ChatPanel v-if="isOpenChatPanel" :title-enabled="false">
              <template #content>
                <div>
                  {{ selectedChat?.name }}
                  <button class="button-close" @click="toggleChatPanel">
                    <span class="pi pi-times" />
                  </button>
                </div>
              </template>
            </ChatPanel>
          </template>
        </ChatWrapper>
      </template>
    </ExtendedLayout>
  </BaseContainer>
</template>

<script setup>
import { ref, computed, onMounted, unref } from "vue";
import moment from "moment";
import {
  ChatInfo, ChatInput, ChatList, Feed, ThemeMode, SideBar,
  ChatPanel, BaseContainer, ExtendedLayout, ChatWrapper,
  FeedSearch, FeedFoundObjects, ButtonCommandsSelector,
  ButtonEmojiPicker, ButtonTemplateSelector, FileUploader,
  SplashScreen, useModalSelectUser2, useModalCreateDialog
} from "@mobilon-dev/chotto";
import {useChatsStore} from "./stores/useChatStore";
import {transformToFeed} from "./transform/transformToFeed";
import {playNotificationAudio} from "./helpers";

// Props
const props = defineProps({
  authProvider: {type: Object, required: true},
  dataProvider: {type: Object, required: true},
  eventor: {type: Object, required: true},
  locale: {type: String, default: "ru"},
});

// Refs
const refContainer = ref();
const refChatWrapper = ref();

const chatsStore = useChatsStore();
const selectedChat = ref(null);
const selectedDialog = ref(null);
const messages = ref([]);
const foundMessages = ref([]);
const sidebarItems = ref([]);
const channels = ref([]);
const templates = ref([]);
const groupTemplates = ref([]);
const isOpenChatPanel = ref(false);
const isOpenSearchPanel = ref(false);
const isShowFeedWhileSearch = ref(true);
const feedSearchFeedCol = ref(false);
const scrollToBottomOnSelectChat = ref(false);
const isScrollToBottomOnUpdateObjectsEnabled = ref(false);
const inputFocus = ref(false);
const filebumpUrl = ref("https://filebump2.services.mobilon.ru");
const clickedReply = ref("");
const chatPanelWidth = ref(50);
const isShowReturnButton = ref(false);
const description = ref("");
const theme = ref("");

const themes = [{code: "mobilon1", name: "mobilon1", default: true}];
const buttonParams = {unreadAmount: 12};

// Computed
const commands = computed(() => selectedChat.value?.commands || null);
const showChatList = computed(() => !isOpenSearchPanel.value || feedSearchFeedCol.value);
const showFeedSearch = computed(() => isOpenSearchPanel.value && !feedSearchFeedCol.value);
const showFoundObjects = computed(() => isOpenSearchPanel.value && !feedSearchFeedCol.value && foundMessages.value.length > 0);
const showFeedSearchInThirdCol = computed(() => isOpenSearchPanel.value && feedSearchFeedCol.value);
const showFoundObjectsInThirdCol = computed(() => isOpenSearchPanel.value && feedSearchFeedCol.value && !isShowFeedWhileSearch.value);
const showFeed = computed(() => isShowFeedWhileSearch.value || !feedSearchFeedCol.value);

// Methods
const setTheme = (code) => (theme.value = code);
const toggleSearchPanel = () => {
  isOpenSearchPanel.value = !isOpenSearchPanel.value;
  isShowFeedWhileSearch.value = !isShowFeedWhileSearch.value;
};
const toggleChatPanel = () => (isOpenChatPanel.value = !isOpenChatPanel.value);

const selectItem = (item) => console.log("selected sidebar item", item);
const loadMoreChats = () => console.log("load more chats");
const chatAction = async (data) => {
  if (data.action === "add") await useModalSelectUser2("Укажите новых участников чата", props.dataProvider.getUsers());
  if (data.action === "addDialog") await useModalCreateDialog("Новый диалог", data.chat.name, data.chat.contact.attributes, channels.value, null, theme.value);
};

const messageAction = (data) => console.log("message action", data);
const messageVisible = (msg) => {
  const _ = msg;
};

const getFeedObjects = () => {
  if (!selectedChat.value) return [];
  let feed = props.dataProvider.getFeed(selectedChat.value.chatId);
  if (selectedDialog.value && selectedDialog.value.dialogId != "all")
    feed = feed.filter(m => m.dialogId === selectedDialog.value.dialogId);
  return transformToFeed(feed);
};

const selectChat = (args) => {
  selectedChat.value = args.chat;
  selectedDialog.value = args.dialog || args.chat.dialogs?.[0] || null;
  description.value = selectedDialog.value?.name || null;
  isShowFeedWhileSearch.value = true;
  scrollToBottomOnSelectChat.value = true;
  inputFocus.value = true;
  messages.value = getFeedObjects();
  chatsStore.setUnreadCounter(args.chat.chatId, 0);
  setTimeout(() => {
    scrollToBottomOnSelectChat.value = false;
    inputFocus.value = false;
  }, 50);
};

const addMessage = (msg) => {
  if (!selectedChat.value) return;
  props.dataProvider.addMessage({
    chatId: selectedChat.value.chatId,
    text: msg.text,
    type: msg.type,
    url: msg.url || null,
    filename: msg.filename || null,
    status: "sent",
    direction: "outgoing",
    timestamp: moment().unix(),
    reply: msg.reply || null,
  });
  messages.value = getFeedObjects();
};

const searchMessages = (query) => {
  if (!query) {
    foundMessages.value = [];
    isShowFeedWhileSearch.value = true;
    return;
  }
  const results = transformToFeed(props.dataProvider.getMessagesBySearch(selectedChat.value.chatId, query)).reverse();
  foundMessages.value = results.filter(m => !["system.date", "message.system"].includes(m.type));
  notFoundMessage.value = foundMessages.value.length === 0;
  isShowFeedWhileSearch.value = foundMessages.value.length > 0 ? false : true;
};

const openMessage = (messageId) => {
  const message = messages.value.find(m => m.messageId === messageId) || transformToFeed(props.dataProvider.getFeedByMessage(selectedChat.value.chatId, messageId));
  highlightMessage(messageId);
  isShowFeedWhileSearch.value = true;
};

let timer;
const highlightMessage = (messageId) => {
  clearTimeout(timer);
  clickedReply.value = JSON.stringify(messages.value.find(m => m.messageId === messageId));
  timer = setTimeout(() => {
    clickedReply.value = "";
  }, 100);
};

const expandChat = (args) => {
  chatsStore.chats.forEach(chat => chat.dialogsExpanded = chat.chatId === args.chatId ? !chat.dialogsExpanded : false);
};

const handleReturnToChats = () => {
  isShowReturnButton.value = true;
  feedSearchFeedCol.value = false;
};

// Event Handling
const handleEvent = async (event) => {
  if (event.type === "message") {
    chatsStore.setUnreadCounter(event.data.chatId, 1);
    if (event.data.chatId === selectedChat?.value?.chatId) messages.value = getFeedObjects();
    await playNotificationAudio();
  }
};

// Resize Observer
const resizeObserver = new ResizeObserver(([containerEntry, chatWrapperEntry]) => {
  const width = containerEntry.target.clientWidth;
  feedSearchFeedCol.value = width < 920;
  isShowReturnButton.value = width < 920;
  chatPanelWidth.value = chatWrapperEntry.target.clientWidth < 700 ? 80 : 60;
});

// Lifecycle
onMounted(() => {
  props.eventor.subscribe(handleEvent);
  sidebarItems.value = props.dataProvider.getSidebarItems();
  channels.value = props.dataProvider.getChannels();
  templates.value = props.dataProvider.getTemplates();
  groupTemplates.value = props.dataProvider.getGroupTemplates();
  chatsStore.chats = props.dataProvider.getChats();

  if (unref(refContainer).$el) resizeObserver.observe(unref(refContainer).$el);
  if (unref(refChatWrapper).$el) resizeObserver.observe(unref(refChatWrapper).$el);
});
</script>

<style lang="scss">
.feed-location {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-info__buttons {
  display: flex;
}

.tg-message {
  --chotto-message-right-bg: #DAF0FF;
  --chotto-message-right-secondary-bg: #bce1fa;
  --chotto-message-accent-line-color: #37AFE2;
  --chotto-chat-input-icon-color: #37AFE2;
}

.wa-message {
  --chotto-message-right-bg: #D9FDD3;
  --chotto-message-right-secondary-bg: #bbf3b2;
  --chotto-message-accent-line-color: #25D366;
  --chotto-chat-input-icon-color: #25D366;
}

.empty-feed-text {
  max-width: 300px;
  display: block;
}
</style>

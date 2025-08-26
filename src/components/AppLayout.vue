<template>
  <BaseContainer ref="refContainer" height="90vh" width="90vw">
    <ExtendedLayout>
      <!-- Sidebar -->
      <template #first-col>
        <SidebarSection
          :sidebar-items="sidebarItems"
          :themes="themes"
          @select-item="selectItem"
          @selected-theme="setTheme"
        />
      </template>

      <!-- Chat List / Search -->
      <template #second-col>
        <ChatListSection
          :chats="chatsStore.chats"
          :is-open-search="isOpenSearchPanel"
          :feed-search-feed-col="feedSearchFeedCol"
          :found-messages="foundMessages"
          @select-chat="selectChat"
          @expand-chat="expandChat"
          @chat-action="chatAction"
          @load-more-chats="loadMoreChats"
          @search="searchMessages"
          @cancel-search="toggleSearchPanel"
          @clicked-search="openMessage"
        />
      </template>

      <!-- Chat Panel -->
      <template #third-col>
        <ChatPanelSection
          ref="refChatWrapper"
          :selected-chat="selectedChat"
          :selected-dialog="selectedDialog"
          :messages="messages"
          :found-messages="foundMessages"
          :is-open-chat-panel="isOpenChatPanel"
          :is-open-search="isOpenSearchPanel"
          :feed-search-feed-col="feedSearchFeedCol"
          :is-show-feed-while-search="isShowFeedWhileSearch"
          :chat-panel-width="chatPanelWidth"
          :input-focus="inputFocus"
          :commands="commands"
          :templates="templates"
          :group-templates="groupTemplates"
          :filebump-url="filebumpUrl"
          @toggle-chat-panel="toggleChatPanel"
          @search="searchMessages"
          @cancel-search="toggleSearchPanel"
          @clicked-search="openMessage"
          @message-action="messageAction"
          @load-more="loadMore"
          @load-more-down="loadMoreDown"
          @click-replied-message="openMessage"
          @force-scroll-to-bottom="forceScrollToBottom"
          @keyboard-action="keyboardAction"
          @add-message="addMessage"
          @return-to-chats="handleReturnToChats"
        />
      </template>
    </ExtendedLayout>
  </BaseContainer>
</template>

<script setup>
import { ref, computed, onMounted, unref } from "vue";
import moment from "moment";
import SidebarSection from "./SidebarSection.vue";
import ChatListSection from "./ChatListSection.vue";
import ChatPanelSection from "./ChatPanelSection.vue";

import { useChatsStore } from "@/stores/useChatStore";
import { transformToFeed } from "@/transform/transformToFeed";
import { playNotificationAudio } from "@/helpers";
import { BaseContainer, ExtendedLayout } from "@mobilon-dev/chotto";
import { useModalSelectUser2, useModalCreateDialog } from "@mobilon-dev/chotto";

// Props
const props = defineProps({
  authProvider: { type: Object, required: true },
  dataProvider: { type: Object, required: true },
  eventor: { type: Object, required: true },
  locale: { type: String, default: "ru" },
});

// Refs
const refContainer = ref();
const refChatWrapper = ref();

// Store
const chatsStore = useChatsStore();

// State
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
const chatPanelWidth = ref(50);
const isShowReturnButton = ref(false);
const description = ref("");
const theme = ref("");
const themes = [{ code: "mobilon1", name: "mobilon1", default: true }];
const buttonParams = { unreadAmount: 12 };

// Computed
const commands = computed(() => selectedChat.value?.commands || null);

// ------------------ Методы обработки ------------------ //

const setTheme = (code) => (theme.value = code);

const toggleSearchPanel = () => {
  isOpenSearchPanel.value = !isOpenSearchPanel.value;
  isShowFeedWhileSearch.value = !isShowFeedWhileSearch.value;
};

const toggleChatPanel = () => (isOpenChatPanel.value = !isOpenChatPanel.value);

const selectItem = (item) => console.log("selected sidebar item", item);
const loadMoreChats = () => console.log("load more chats");

const chatAction = async (data) => {
  if (data.action === "add") {
    await useModalSelectUser2("Укажите новых участников чата", props.dataProvider.getUsers());
  }
  if (data.action === "addDialog") {
    await useModalCreateDialog(
      "Новый диалог",
      data.chat.name,
      data.chat.contact.attributes,
      channels.value,
      null,
      theme.value
    );
  }
};

const loadMore = async () => {
  if (!selectedChat.value) return;
  console.log("load more messages");
  messages.value = getFeedObjects(); // подгрузка новых сообщений, если нужно
};

const loadMoreDown = async () => {
  if (!selectedChat.value) return;
  console.log("load more down messages");
};

const forceScrollToBottom = () => {
  scrollToBottomOnSelectChat.value = true;
  setTimeout(() => scrollToBottomOnSelectChat.value = false, 50);
};

const keyboardAction = (action) => {
  console.log("keyboard action", action);
};

const messageAction = (data) => console.log("message action", data);
const messageVisible = (msg) => { const _ = msg; };

// ------------------ Feed & Messages ------------------ //

const getFeedObjects = () => {
  if (!selectedChat.value) return [];
  let feed = props.dataProvider.getFeed(selectedChat.value.chatId);
  if (selectedDialog.value && selectedDialog.value.dialogId !== "all") {
    feed = feed.filter(m => m.dialogId === selectedDialog.value.dialogId);
  }
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
  const results = transformToFeed(
    props.dataProvider.getMessagesBySearch(selectedChat.value.chatId, query)
  ).reverse();
  foundMessages.value = results.filter(m => !["system.date", "message.system"].includes(m.type));
  isShowFeedWhileSearch.value = foundMessages.value.length === 0 ? true : false;
};

const openMessage = (messageId) => {
  const message = messages.value.find(m => m.messageId === messageId)
    || transformToFeed(props.dataProvider.getFeedByMessage(selectedChat.value.chatId, messageId));
  highlightMessage(messageId);
  isShowFeedWhileSearch.value = true;
};

let timer;
const highlightMessage = (messageId) => {
  clearTimeout(timer);
  clickedReply.value = JSON.stringify(messages.value.find(m => m.messageId === messageId));
  timer = setTimeout(() => { clickedReply.value = ""; }, 100);
};

const expandChat = (args) => {
  chatsStore.chats.forEach(chat => chat.dialogsExpanded = chat.chatId === args.chatId ? !chat.dialogsExpanded : false);
};

const handleReturnToChats = () => {
  isShowReturnButton.value = true;
  feedSearchFeedCol.value = false;
};

// ------------------ Events ------------------ //

const handleEvent = async (event) => {
  if (event.type === "message") {
    chatsStore.setUnreadCounter(event.data.chatId, 1);
    if (event.data.chatId === selectedChat?.value?.chatId) messages.value = getFeedObjects();
    await playNotificationAudio();
  }
};

// ------------------ Resize Observer ------------------ //

const resizeObserver = new ResizeObserver(([containerEntry, chatWrapperEntry]) => {
  const width = containerEntry.target.clientWidth;
  feedSearchFeedCol.value = width < 920;
  isShowReturnButton.value = width < 920;
  chatPanelWidth.value = chatWrapperEntry.target.clientWidth < 700 ? 80 : 60;
});

// ------------------ Lifecycle ------------------ //

onMounted(() => {
  props.eventor.subscribe(handleEvent);

  sidebarItems.value = props.dataProvider.getSidebarItems();
  channels.value = props.dataProvider.getChannels();
  templates.value = props.dataProvider.getTemplates();
  groupTemplates.value = props.dataProvider.getGroupTemplates();
  chatsStore.chats = props.dataProvider.getChats();
  const containerEl = refContainer.value?.$el || refContainer.value?.$el?.$el;
  if (containerEl) resizeObserver.observe(containerEl);

  const wrapperEl = refChatWrapper.value?.$el || refChatWrapper.value?.$el?.$el;
  if (wrapperEl) resizeObserver.observe(wrapperEl);
});
</script>

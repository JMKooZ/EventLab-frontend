<script setup>
import { computed, ref } from "vue";

const activeFilter = ref("ALL");
const searchKeyword = ref("");
const notice = ref("");

const filters = [
  { label: "전체", value: "ALL" },
  { label: "진행 중", value: "RUNNING" },
  { label: "대기 중", value: "WAITING" },
  { label: "종료", value: "ENDED" },
];

const events = ref([
  {
    id: 1,
    title: "2026 하반기 개발팀 워크숍",
    description: "팀원들과 함께하는 아이디어 공유 및 의견 수렴",
    type: "POLL",
    status: "RUNNING",
    participants: 24,
    maxParticipants: 100,
    questionCount: 8,
    createdAt: "2026.10.28",
  },
  {
    id: 2,
    title: "신규 서비스 아이디어 퀴즈",
    description: "신규 서비스 관련 지식 테스트",
    type: "QUIZ",
    status: "WAITING",
    participants: 12,
    maxParticipants: 50,
    questionCount: 10,
    createdAt: "2026.10.27",
  },
  {
    id: 3,
    title: "사내 만족도 설문조사",
    description: "2026년 하반기 사내 만족도 조사",
    type: "POLL",
    status: "ENDED",
    participants: 86,
    maxParticipants: 100,
    questionCount: 12,
    createdAt: "2026.10.20",
  },
  {
    id: 4,
    title: "신입사원 온보딩 퀴즈",
    description: "회사 문화 및 업무 프로세스 퀴즈",
    type: "QUIZ",
    status: "ENDED",
    participants: 32,
    maxParticipants: 50,
    questionCount: 6,
    createdAt: "2026.10.15",
  },
]);

const filteredEvents = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();

  return events.value.filter((event) => {
    const matchesFilter =
      activeFilter.value === "ALL" || event.status === activeFilter.value;

    const matchesSearch =
      !keyword ||
      event.title.toLowerCase().includes(keyword) ||
      event.description.toLowerCase().includes(keyword);

    return matchesFilter && matchesSearch;
  });
});

const totalEvents = computed(() => events.value.length);

const runningEvents = computed(
  () => events.value.filter((event) => event.status === "RUNNING").length,
);

const totalParticipants = computed(() =>
  events.value.reduce((total, event) => total + event.participants, 0),
);

const getStatus = (status) => {
  const statusMap = {
    RUNNING: { label: "진행 중", className: "status-running" },
    WAITING: { label: "대기 중", className: "status-waiting" },
    ENDED: { label: "종료", className: "status-ended" },
  };

  return statusMap[status];
};

const getType = (type) => {
  return type === "POLL" ? "설문" : "퀴즈";
};

let noticeTimer;

const showMessage = (message) => {
  notice.value = message;

  if (import.meta.client) {
    window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => {
      notice.value = "";
    }, 2500);
  }
};

const openEvent = (event) => {
  showMessage(`"${event.title}" 상세 화면은 다음 단계에서 구현할 예정입니다.`);
};
</script>

<template>
  <div class="dashboard">

    <main class="page-container">
      <section class="welcome-section">
        <div>
          <p class="eyebrow">MY WORKSPACE</p>
          <h1>나의 이벤트</h1>
          <p class="welcome-description">
            이벤트를 만들고 참여 현황을 실시간으로 확인해 보세요.
          </p>
        </div>

        <NuxtLink to="/events/create" class="primary-button create-button">
          <span class="plus-icon">＋</span>
          새 이벤트 만들기
        </NuxtLink>
      </section>

      <section class="summary-grid">
        <article class="summary-card">
          <div class="summary-top">
            <span class="summary-label">전체 이벤트</span>
            <span class="summary-icon icon-purple">▦</span>
          </div>

          <div class="summary-value">{{ totalEvents }}<span>개</span></div>

          <p class="summary-description">지금까지 생성한 이벤트</p>
        </article>

        <article class="summary-card">
          <div class="summary-top">
            <span class="summary-label">진행 중인 이벤트</span>
            <span class="summary-icon icon-green">●</span>
          </div>

          <div class="summary-value">{{ runningEvents }}<span>개</span></div>

          <p class="summary-description">현재 참여 가능한 이벤트</p>
        </article>

        <article class="summary-card">
          <div class="summary-top">
            <span class="summary-label">누적 참여자</span>
            <span class="summary-icon icon-orange">♧</span>
          </div>

          <div class="summary-value">
            {{ totalParticipants }}<span>명</span>
          </div>

          <p class="summary-description">전체 이벤트 참여 인원</p>
        </article>
      </section>

      <section class="event-section">
        <div class="section-heading">
          <div>
            <h2>이벤트 목록</h2>
            <p>생성한 이벤트를 관리할 수 있습니다.</p>
          </div>

          <span class="event-count"> 총 {{ filteredEvents.length }}개 </span>
        </div>

        <div class="toolbar">
          <div class="search-box">
            <span class="search-icon">⌕</span>

            <input
              v-model="searchKeyword"
              type="search"
              placeholder="이벤트 이름으로 검색"
              aria-label="이벤트 검색"
            />
          </div>

          <div class="filter-group">
            <button
              v-for="filter in filters"
              :key="filter.value"
              class="filter-button"
              :class="{ selected: activeFilter === filter.value }"
              @click="activeFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>

        <div v-if="filteredEvents.length" class="event-list">
          <article
            v-for="event in filteredEvents"
            :key="event.id"
            class="event-card"
          >
            <div class="event-card-main">
              <div class="event-title-row">
                <h3>{{ event.title }}</h3>

                <span
                  class="status-badge"
                  :class="getStatus(event.status).className"
                >
                  {{ getStatus(event.status).label }}
                </span>
              </div>

              <p class="event-description">
                {{ event.description }}
              </p>

              <div class="event-meta">
                <span class="type-badge">
                  {{ getType(event.type) }}
                </span>

                <span>{{ event.createdAt }}</span>
                <span>질문 {{ event.questionCount }}개</span>
              </div>
            </div>

            <div class="event-card-side">
              <div class="participant-info">
                <span>참여 인원</span>

                <strong>
                  {{ event.participants }}
                  <small>/ {{ event.maxParticipants }}명</small>
                </strong>
              </div>

              <div class="progress-track">
                <div
                  class="progress-bar"
                  :style="{
                    width: `${Math.min(
                      (event.participants / event.maxParticipants) * 100,
                      100,
                    )}%`,
                  }"
                ></div>
              </div>

              <button class="detail-button" @click="openEvent(event)">
                상세 보기 <span>→</span>
              </button>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">⌕</div>
          <h3>검색 결과가 없습니다.</h3>
          <p>다른 검색어나 필터를 선택해 주세요.</p>
        </div>
      </section>
    </main>

    <Transition name="toast">
      <div v-if="notice" class="toast-message" role="status">
        {{ notice }}
      </div>
    </Transition>
  </div>
</template>

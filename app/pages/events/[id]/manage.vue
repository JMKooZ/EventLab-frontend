<script setup>
import { computed, ref } from "vue";

const event = ref({
  title: "2026 하반기 개발팀 워크숍",
  description: "개발팀 워크숍 만족도 및 의견 수집",
  type: "POLL",
  status: "WAITING",
  inviteCode: "EVT2026",
  maxParticipants: 100,
});

const participants = ref([
  { id: 1, nickname: "밍구", joinedAt: "14:01:12" },
  { id: 2, nickname: "개발자A", joinedAt: "14:02:05" },
  { id: 3, nickname: "프론트엔드왕", joinedAt: "14:02:31" },
  { id: 4, nickname: "백엔드초보", joinedAt: "14:03:10" },
  { id: 5, nickname: "참여자05", joinedAt: "14:03:42" },
]);

const questions = ref([
  {
    id: 1,
    content: "이번 워크숍에서 가장 기대하는 활동은 무엇인가요?",
    timeLimitEnabled: false,
    timeLimitSeconds: null,
    status: "WAITING",
    options: [
      { id: 1, content: "팀 프로젝트", count: 18 },
      { id: 2, content: "기술 세미나", count: 12 },
      { id: 3, content: "네트워킹", count: 8 },
      { id: 4, content: "레크리에이션", count: 4 },
    ],
    correctOptionId: null,
  },
  {
    id: 2,
    content: "가장 관심 있는 기술 분야는 무엇인가요?",
    timeLimitEnabled: true,
    timeLimitSeconds: 30,
    status: "WAITING",
    options: [
      { id: 1, content: "백엔드", count: 15 },
      { id: 2, content: "프론트엔드", count: 14 },
      { id: 3, content: "인프라 및 클라우드", count: 9 },
      { id: 4, content: "AI 및 데이터", count: 4 },
    ],
    correctOptionId: null,
  },
  {
    id: 3,
    content: "다음 워크숍에서 다루었으면 하는 주제가 있나요?",
    timeLimitEnabled: false,
    timeLimitSeconds: null,
    status: "WAITING",
    options: [
      { id: 1, content: "실전 프로젝트", count: 20 },
      { id: 2, content: "코드 리뷰", count: 10 },
      { id: 3, content: "아키텍처 설계", count: 8 },
      { id: 4, content: "기타", count: 4 },
    ],
    correctOptionId: null,
  },
]);

const currentQuestionIndex = ref(0);
const notice = ref("");

const currentQuestion = computed(
  () => questions.value[currentQuestionIndex.value] ?? null,
);

const participantCount = computed(() => participants.value.length);

const participationRate = computed(() => {
  return Math.round(
    (participantCount.value / event.value.maxParticipants) * 100,
  );
});

const totalResponses = computed(() => {
  if (!currentQuestion.value) return 0;

  return currentQuestion.value.options.reduce(
    (total, option) => total + option.count,
    0,
  );
});

const isLastQuestion = computed(
  () => currentQuestionIndex.value === questions.value.length - 1,
);

const eventStatusLabel = computed(() => {
  const labels = {
    WAITING: "시작 대기",
    RUNNING: "진행 중",
    PAUSED: "일시정지",
    ENDED: "종료",
  };

  return labels[event.value.status];
});

const questionStatusLabel = computed(() => {
  if (!currentQuestion.value) return "질문 없음";

  const labels = {
    WAITING: "대기 중",
    ACTIVE: "진행 중",
    CLOSED: "마감",
  };

  return labels[currentQuestion.value.status];
});

const getOptionPercentage = (count) => {
  if (!totalResponses.value) return 0;

  return Math.round((count / totalResponses.value) * 100);
};

const startEvent = () => {
  if (event.value.status !== "WAITING") return;

  event.value.status = "RUNNING";
  currentQuestion.value.status = "ACTIVE";
  notice.value = "이벤트를 시작했습니다.";
};

const pauseEvent = () => {
  if (event.value.status !== "RUNNING") return;

  event.value.status = "PAUSED";
  notice.value = "이벤트를 일시정지했습니다.";
};

const resumeEvent = () => {
  if (event.value.status !== "PAUSED") return;

  event.value.status = "RUNNING";
  notice.value = "이벤트를 다시 시작했습니다.";
};

const closeCurrentQuestion = () => {
  if (
    event.value.status !== "RUNNING" ||
    currentQuestion.value?.status !== "ACTIVE"
  ) {
    return;
  }

  currentQuestion.value.status = "CLOSED";
  notice.value = `${currentQuestionIndex.value + 1}번 질문을 마감했습니다.`;
};

const nextQuestion = () => {
  if (
    event.value.status !== "RUNNING" ||
    currentQuestion.value?.status !== "CLOSED"
  ) {
    return;
  }

  if (isLastQuestion.value) {
    notice.value = "마지막 질문입니다. 이벤트를 종료할 수 있습니다.";
    return;
  }

  currentQuestionIndex.value += 1;
  currentQuestion.value.status = "ACTIVE";

  notice.value = `${currentQuestionIndex.value + 1}번 질문을 시작했습니다.`;
};

const endEvent = () => {
  if (event.value.status === "ENDED") return;

  event.value.status = "ENDED";

  if (currentQuestion.value?.status === "ACTIVE") {
    currentQuestion.value.status = "CLOSED";
  }

  notice.value = "이벤트가 종료되었습니다.";
};

const copyText = async (value, label) => {
  if (!import.meta.client) return;

  try {
    await navigator.clipboard.writeText(value);
    notice.value = `${label}을(를) 복사했습니다.`;
  } catch {
    notice.value = "복사에 실패했습니다. 브라우저 권한을 확인해 주세요.";
  }
};

const copyInviteLink = () => {
  const inviteUrl = `${window.location.origin}/join/${event.value.inviteCode}`;

  copyText(inviteUrl, "초대 링크");
};
</script>

<template>
  <div class="event-manage-page">
    <main class="page-container">
      <div class="manage-heading">
        <NuxtLink to="/" class="manage-back-link">
          <span>←</span>
          대시보드
        </NuxtLink>

        <div class="manage-title-row">
          <div>
            <p class="eyebrow">EVENT MANAGEMENT</p>
            <h1>{{ event.title }}</h1>
            <p class="manage-description">{{ event.description }}</p>
          </div>

          <span
            class="event-status-badge"
            :class="`status-${event.status.toLowerCase()}`"
          >
            {{ eventStatusLabel }}
          </span>
        </div>
      </div>

      <!-- Event Summary -->
      <section class="manage-summary">
        <article class="summary-card">
          <span class="summary-label">참여 인원</span>
          <strong>
            {{ participantCount }}
            <small>/ {{ event.maxParticipants }}명</small>
          </strong>
          <div class="summary-progress">
            <span :style="{ width: `${participationRate}%` }"></span>
          </div>
        </article>

        <article class="summary-card">
          <span class="summary-label">질문 진행</span>
          <strong>
            {{ currentQuestionIndex + 1 }}
            <small>/ {{ questions.length }}개</small>
          </strong>
          <p class="summary-description">현재 질문 기준</p>
        </article>

        <article class="summary-card">
          <span class="summary-label">이벤트 유형</span>
          <strong>{{ event.type === "QUIZ" ? "퀴즈" : "설문" }}</strong>
          <p class="summary-description">생성 시 설정한 유형</p>
        </article>
      </section>

      <div class="manage-layout">
        <div class="manage-main">
          <!-- Host Controls -->
          <section class="manage-card control-card">
            <div class="manage-section-heading">
              <div>
                <span class="step-label">HOST CONTROL</span>
                <h2>이벤트 운영</h2>
                <p>이벤트 진행 상태를 관리할 수 있습니다.</p>
              </div>
            </div>

            <div class="event-control-actions">
              <button
                v-if="event.status === 'WAITING'"
                type="button"
                class="primary-button"
                @click="startEvent"
              >
                이벤트 시작
              </button>

              <template v-else-if="event.status === 'RUNNING'">
                <button
                  type="button"
                  class="secondary-button"
                  @click="pauseEvent"
                >
                  일시정지
                </button>

                <button
                  type="button"
                  class="danger-button"
                  :disabled="currentQuestion?.status !== 'ACTIVE'"
                  @click="closeCurrentQuestion"
                >
                  현재 질문 마감
                </button>

                <button
                  type="button"
                  class="primary-button"
                  :disabled="
                    currentQuestion?.status !== 'CLOSED' || isLastQuestion
                  "
                  @click="nextQuestion"
                >
                  다음 질문
                </button>
              </template>

              <button
                v-else-if="event.status === 'PAUSED'"
                type="button"
                class="primary-button"
                @click="resumeEvent"
              >
                이벤트 재개
              </button>

              <span v-else class="ended-message"> 종료된 이벤트입니다. </span>

              <button
                v-if="event.status !== 'ENDED'"
                type="button"
                class="danger-outline-button"
                @click="endEvent"
              >
                이벤트 종료
              </button>
            </div>

            <p v-if="notice" class="manage-notice">
              {{ notice }}
            </p>
          </section>

          <!-- Current Question -->
          <section class="manage-card current-question-card">
            <div class="manage-section-heading question-manage-heading">
              <div>
                <span class="step-label">CURRENT QUESTION</span>
                <h2>현재 질문</h2>
              </div>

              <span
                v-if="currentQuestion"
                class="question-status-badge"
                :class="`question-${currentQuestion.status.toLowerCase()}`"
              >
                {{ questionStatusLabel }}
              </span>
            </div>

            <template v-if="currentQuestion">
              <div class="current-question-number">
                QUESTION {{ currentQuestionIndex + 1 }}
              </div>

              <h3 class="current-question-title">
                {{ currentQuestion.content }}
              </h3>

              <div class="question-meta">
                <span>
                  <span class="meta-dot"></span>
                  {{ currentQuestion.options.length }}개 선택지
                </span>

                <span>
                  <span class="meta-dot"></span>
                  {{
                    currentQuestion.timeLimitEnabled
                      ? `${currentQuestion.timeLimitSeconds}초 제한`
                      : "시간 제한 없음"
                  }}
                </span>

                <span>
                  <span class="meta-dot"></span>
                  {{ totalResponses }}명 응답
                </span>
              </div>

              <div class="result-heading">
                <strong>응답 현황</strong>
                <span>
                  {{
                    currentQuestion.status === "CLOSED"
                      ? "최종 결과"
                      : "현재 집계"
                  }}
                </span>
              </div>

              <div
                v-if="
                  event.type === 'POLL' || currentQuestion.status === 'CLOSED'
                "
                class="result-list"
              >
                <div
                  v-for="(option, index) in currentQuestion.options"
                  :key="option.id"
                  class="result-item"
                >
                  <div class="result-item-heading">
                    <span class="result-option-name">
                      {{ index + 1 }}. {{ option.content }}
                    </span>

                    <strong>
                      {{ option.count }}명
                      <small>{{ getOptionPercentage(option.count) }}%</small>
                    </strong>
                  </div>

                  <div class="result-bar">
                    <span
                      :style="{
                        width: `${getOptionPercentage(option.count)}%`,
                      }"
                    ></span>
                  </div>
                </div>
              </div>

              <div v-else class="hidden-result">
                <span class="hidden-result-icon">◈</span>
                <strong>퀴즈 결과는 질문 마감 후 공개됩니다.</strong>
                <p>정답과 점수는 질문이 종료되면 확인할 수 있습니다.</p>
              </div>

              <div
                v-if="
                  event.type === 'QUIZ' && currentQuestion.status === 'CLOSED'
                "
                class="quiz-answer-notice"
              >
                정답:
                {{
                  currentQuestion.options.find(
                    (option) => option.id === currentQuestion.correctOptionId,
                  )?.content ?? "정답 미설정"
                }}
              </div>
            </template>
          </section>

          <!-- Question List -->
          <section class="manage-card question-overview-card">
            <div class="manage-section-heading">
              <div>
                <span class="step-label">QUESTION LIST</span>
                <h2>전체 질문</h2>
                <p>이벤트에 등록된 질문 목록입니다.</p>
              </div>
            </div>

            <div class="question-overview-list">
              <div
                v-for="(question, index) in questions"
                :key="question.id"
                class="question-overview-item"
                :class="{
                  'is-current': index === currentQuestionIndex,
                }"
              >
                <span class="overview-number">{{ index + 1 }}</span>

                <div class="overview-content">
                  <strong>{{ question.content }}</strong>
                  <span>
                    {{ question.options.length }}개 선택지 ·
                    {{
                      question.timeLimitEnabled
                        ? `${question.timeLimitSeconds}초`
                        : "시간 제한 없음"
                    }}
                  </span>
                </div>

                <span
                  class="question-status-badge"
                  :class="`question-${question.status.toLowerCase()}`"
                >
                  {{
                    question.status === "ACTIVE"
                      ? "진행 중"
                      : question.status === "CLOSED"
                        ? "마감"
                        : "대기"
                  }}
                </span>
              </div>
            </div>
          </section>
        </div>

        <aside class="manage-side">
          <!-- Invite -->
          <section class="manage-card invite-card">
            <span class="step-label">INVITATION</span>
            <h2>참여자 초대</h2>
            <p>아래 초대 코드를 참여자에게 공유해 주세요.</p>

            <div class="invite-code">
              <strong>{{ event.inviteCode }}</strong>
              <button
                type="button"
                aria-label="초대 코드 복사"
                @click="copyText(event.inviteCode, '초대 코드')"
              >
                복사
              </button>
            </div>

            <button
              type="button"
              class="primary-button invite-link-button"
              @click="copyInviteLink"
            >
              초대 링크 복사
            </button>

            <p class="invite-guide">
              참여자는 회원가입 없이 초대 코드로 입장할 수 있습니다.
            </p>
          </section>

          <!-- Participants -->
          <section class="manage-card participant-card">
            <div class="participant-heading">
              <div>
                <span class="step-label">PARTICIPANTS</span>
                <h2>참여자</h2>
              </div>

              <span class="participant-count"> {{ participantCount }}명 </span>
            </div>

            <div class="participant-progress">
              <div>
                <span>참여 인원</span>
                <strong>
                  {{ participantCount }} / {{ event.maxParticipants }}
                </strong>
              </div>

              <div class="summary-progress">
                <span :style="{ width: `${participationRate}%` }"></span>
              </div>
            </div>

            <div class="participant-list">
              <div
                v-for="participant in participants"
                :key="participant.id"
                class="participant-item"
              >
                <span class="participant-avatar">
                  {{ participant.nickname.slice(0, 1) }}
                </span>

                <div class="participant-info">
                  <strong>{{ participant.nickname }}</strong>
                  <span>{{ participant.joinedAt }} 입장</span>
                </div>
              </div>
            </div>

            <p class="participant-demo-notice">
              현재 참여자 목록은 화면 확인용 더미 데이터입니다.
            </p>
          </section>
        </aside>
      </div>
    </main>
  </div>
</template>

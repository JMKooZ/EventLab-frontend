<script setup>
import { computed, ref } from "vue";

const event = ref({
  title: "2026 하반기 개발팀 워크숍",
  description: "개발팀 워크숍 만족도 및 의견 수집",
  status: "RUNNING",
  inviteCode: "EVT2026",
  maxParticipants: 100,
});

// 화면 확인용 예시 데이터입니다. 실제 API 연결 시 서버 응답으로 교체합니다.
const participants = ref([
  { id: 1, nickname: "밍구", joinedAt: "14:01", submitted: true },
  { id: 2, nickname: "개발자A", joinedAt: "14:02", submitted: true },
  { id: 3, nickname: "프론트엔드왕", joinedAt: "14:02", submitted: true },
  { id: 4, nickname: "백엔드초보", joinedAt: "14:03", submitted: false },
  { id: 5, nickname: "참여자05", joinedAt: "14:03", submitted: true },
  { id: 6, nickname: "참여자06", joinedAt: "14:04", submitted: false },
]);

const questions = ref([
  {
    id: 1,
    content: "이번 워크숍에서 가장 기대하는 활동은 무엇인가요?",
    questionType: "SINGLE_CHOICE",
    isRequired: true,
    responseCount: 24,
    options: [
      { id: 1, content: "팀 프로젝트", count: 10 },
      { id: 2, content: "기술 세미나", count: 7 },
      { id: 3, content: "네트워킹", count: 5 },
      { id: 4, content: "레크리에이션", count: 2 },
    ],
    otherCount: 0,
  },
  {
    id: 2,
    content: "관심 있는 기술 분야를 모두 선택해 주세요.",
    questionType: "MULTIPLE_CHOICE",
    isRequired: true,
    responseCount: 22,
    options: [
      { id: 1, content: "백엔드", count: 14 },
      { id: 2, content: "프론트엔드", count: 12 },
      { id: 3, content: "인프라 및 클라우드", count: 8 },
      { id: 4, content: "AI 및 데이터", count: 11 },
    ],
    otherCount: 2,
  },
  {
    id: 3,
    content: "이번 워크숍에서 다루었으면 하는 주제를 적어주세요.",
    questionType: "LONG_TEXT",
    isRequired: false,
    responseCount: 18,
    answers: [
      {
        id: 1,
        nickname: "밍구",
        content:
          "실제 서비스에 적용할 수 있는 아키텍처 설계를 다뤄보고 싶습니다.",
        submittedAt: "14:12",
      },
      {
        id: 2,
        nickname: "개발자A",
        content: "코드 리뷰와 테스트 자동화 사례가 궁금합니다.",
        submittedAt: "14:13",
      },
      {
        id: 3,
        nickname: "참여자05",
        content: "팀 간 협업 방식과 기술 공유 세션이 있으면 좋겠습니다.",
        submittedAt: "14:15",
      },
    ],
  },
  {
    id: 4,
    content: "현재 업무 만족도를 선택해 주세요.",
    questionType: "RATING",
    isRequired: true,
    responseCount: 20,
    scaleMin: 1,
    scaleMax: 5,
    average: 4.1,
    distribution: [1, 1, 3, 7, 8],
  },
]);

const selectedQuestionId = ref(1);
const notice = ref("");
const selectedQuestion = computed(
  () =>
    questions.value.find(
      (question) => question.id === selectedQuestionId.value,
    ) ?? null,
);
const participantCount = computed(() => participants.value.length);
const submittedCount = computed(
  () =>
    participants.value.filter((participant) => participant.submitted).length,
);
const completionRate = computed(() =>
  participantCount.value
    ? Math.round((submittedCount.value / participantCount.value) * 100)
    : 0,
);
const participationRate = computed(() =>
  event.value.maxParticipants
    ? Math.min(
        100,
        Math.round(
          (participantCount.value / event.value.maxParticipants) * 100,
        ),
      )
    : 0,
);
const totalQuestionResponses = computed(() =>
  questions.value.reduce(
    (total, question) => total + question.responseCount,
    0,
  ),
);

const eventStatusLabel = computed(
  () => eventStatusOf(event.value.status).label,
);

const questionTypeLabel = (type) =>
  ({
    SINGLE_CHOICE: "단일 선택",
    MULTIPLE_CHOICE: "다중 선택",
    SHORT_TEXT: "단답형",
    LONG_TEXT: "장문형",
    RATING: "척도형",
  })[type] ?? "질문";

const optionPercentage = (count, question) =>
  question?.responseCount
    ? Math.round((count / question.responseCount) * 100)
    : 0;

const scalePercentage = (count, question) => {
  const total =
    question?.distribution?.reduce((sum, value) => sum + value, 0) ?? 0;
  return total ? Math.round((count / total) * 100) : 0;
};

const startEvent = () => {
  if (event.value.status !== "DRAFT") return;
  event.value.status = "RUNNING";
  notice.value =
    "이벤트를 시작했습니다. 실제 참여자에게 반영하려면 API 연결이 필요합니다.";
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
const endEvent = () => {
  if (event.value.status === "ENDED") return;
  event.value.status = "ENDED";
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
  if (!import.meta.client) return;
  copyText(
    `${window.location.origin}/join/${event.value.inviteCode}`,
    "초대 링크",
  );
};
</script>

<template>
  <div class="event-manage-page">
    <main class="page-container">
      <header class="manage-heading">
        <NuxtLink to="/" class="manage-back-link"
          ><span>←</span> 대시보드</NuxtLink
        >
        <div class="manage-title-row">
          <div>
            <p class="eyebrow">HOST DASHBOARD</p>
            <h1>{{ event.title }}</h1>
            <p class="manage-description">{{ event.description }}</p>
          </div>
          <span
            class="event-status-badge"
            :class="eventStatusOf(event.status).className"
          >
            {{ eventStatusLabel }}
          </span>
        </div>
      </header>

      <section class="manage-summary host-summary-grid">
        <article class="summary-card">
          <span class="summary-label">참여 인원</span>
          <strong
            >{{ participantCount
            }}<small> / {{ event.maxParticipants }}명</small></strong
          >
          <div class="summary-progress">
            <span :style="{ width: `${participationRate}%` }"></span>
          </div>
          <p class="summary-description">
            전체 정원 대비 참여 비율 {{ participationRate }}%
          </p>
        </article>
        <article class="summary-card">
          <span class="summary-label">응답 완료</span>
          <strong
            >{{ submittedCount
            }}<small> / {{ participantCount }}명</small></strong
          >
          <div class="summary-progress">
            <span :style="{ width: `${completionRate}%` }"></span>
          </div>
          <p class="summary-description">응답 완료율 {{ completionRate }}%</p>
        </article>
        <article class="summary-card">
          <span class="summary-label">전체 응답 수</span>
          <strong>{{ totalQuestionResponses }}<small>건</small></strong>
          <p class="summary-description">질문별 응답 수 합계</p>
        </article>
      </section>

      <div class="manage-layout">
        <div class="manage-main">
          <section class="manage-card control-card">
            <div class="manage-section-heading">
              <div>
                <span class="step-label">EVENT CONTROL</span>
                <h2>이벤트 운영</h2>
                <p>이벤트 진행 상태를 관리합니다.</p>
              </div>
            </div>
            <div class="event-control-actions">
              <button
                v-if="event.status === 'DRAFT'"
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
                  class="danger-outline-button"
                  @click="endEvent"
                >
                  이벤트 종료
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
              <span v-else class="ended-message">종료된 이벤트입니다.</span>
            </div>
            <p v-if="notice" class="manage-notice">{{ notice }}</p>
          </section>

          <section class="manage-card analytics-card">
            <div class="manage-section-heading analytics-heading">
              <div>
                <span class="step-label">RESPONSE ANALYTICS</span>
                <h2>질문별 응답 통계</h2>
                <p>
                  질문을 선택하면 응답 분포와 주관식 답변을 확인할 수 있습니다.
                </p>
              </div>
              <span class="analytics-total">{{ questions.length }}개 질문</span>
            </div>

            <div
              class="analytics-question-tabs"
              role="tablist"
              aria-label="통계를 확인할 질문"
            >
              <button
                v-for="(question, index) in questions"
                :key="question.id"
                type="button"
                class="analytics-question-tab"
                :class="{ selected: selectedQuestionId === question.id }"
                :aria-selected="selectedQuestionId === question.id"
                role="tab"
                @click="selectedQuestionId = question.id"
              >
                <span>Q{{ index + 1 }}</span
                >{{ questionTypeLabel(question.questionType) }}
              </button>
            </div>

            <template v-if="selectedQuestion">
              <div class="analytics-question-title">
                <div>
                  <span
                    >QUESTION
                    {{
                      questions.findIndex(
                        (item) => item.id === selectedQuestion.id,
                      ) + 1
                    }}</span
                  >
                  <h3>{{ selectedQuestion.content }}</h3>
                </div>
                <span class="question-status-badge question-active">{{
                  questionTypeLabel(selectedQuestion.questionType)
                }}</span>
              </div>
              <div class="analytics-meta-row">
                <span>응답 {{ selectedQuestion.responseCount }}건</span>
                <span v-if="selectedQuestion.isRequired">필수 응답</span>
                <span v-else>선택 응답</span>
              </div>

              <div
                v-if="
                  ['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(
                    selectedQuestion.questionType,
                  )
                "
                class="analytics-result-list"
              >
                <div
                  v-for="(option, index) in selectedQuestion.options"
                  :key="option.id"
                  class="analytics-result-item"
                >
                  <div class="analytics-result-label">
                    <span>{{ option.content }}</span
                    ><strong
                      >{{ option.count
                      }}<small
                        >건 ·
                        {{
                          optionPercentage(option.count, selectedQuestion)
                        }}%</small
                      ></strong
                    >
                  </div>
                  <div class="analytics-result-track">
                    <span
                      :style="{
                        width: `${optionPercentage(option.count, selectedQuestion)}%`,
                      }"
                    ></span>
                  </div>
                </div>
                <div
                  v-if="selectedQuestion.otherCount"
                  class="analytics-result-item"
                >
                  <div class="analytics-result-label">
                    <span>기타 응답</span
                    ><strong
                      >{{ selectedQuestion.otherCount
                      }}<small>건</small></strong
                    >
                  </div>
                </div>
                <p
                  v-if="selectedQuestion.questionType === 'MULTIPLE_CHOICE'"
                  class="analytics-footnote"
                >
                  다중 선택 질문은 한 사람이 여러 항목을 선택할 수 있어 선택 수
                  합계가 응답 인원보다 클 수 있습니다.
                </p>
              </div>

              <div
                v-else-if="selectedQuestion.questionType === 'RATING'"
                class="rating-analytics"
              >
                <div class="rating-average">
                  <strong>{{ selectedQuestion.average.toFixed(1) }}</strong
                  ><span>/ {{ selectedQuestion.scaleMax }}점 평균</span>
                </div>
                <div class="analytics-result-list">
                  <div
                    v-for="(count, index) in selectedQuestion.distribution"
                    :key="index"
                    class="analytics-result-item"
                  >
                    <div class="analytics-result-label">
                      <span>{{ selectedQuestion.scaleMin + index }}점</span
                      ><strong
                        >{{ count
                        }}<small
                          >명 ·
                          {{ scalePercentage(count, selectedQuestion) }}%</small
                        ></strong
                      >
                    </div>
                    <div class="analytics-result-track">
                      <span
                        :style="{
                          width: `${scalePercentage(count, selectedQuestion)}%`,
                        }"
                      ></span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-answer-list">
                <div
                  v-for="answer in selectedQuestion.answers"
                  :key="answer.id"
                  class="text-answer-item"
                >
                  <div class="text-answer-meta">
                    <strong>{{ answer.nickname }}</strong
                    ><span>{{ answer.submittedAt }} 응답</span>
                  </div>
                  <p>{{ answer.content }}</p>
                </div>
                <p
                  v-if="!selectedQuestion.answers?.length"
                  class="analytics-empty"
                >
                  아직 등록된 주관식 응답이 없습니다.
                </p>
              </div>
            </template>
          </section>

          <section class="manage-card participant-overview-card">
            <div class="manage-section-heading">
              <div>
                <span class="step-label">PARTICIPANT STATUS</span>
                <h2>참여자 응답 현황</h2>
                <p>참여자의 입장 및 응답 제출 상태입니다.</p>
              </div>
              <span class="analytics-total">{{ participantCount }}명 참여</span>
            </div>
            <div class="participant-table-wrap">
              <table class="participant-table">
                <thead>
                  <tr>
                    <th>참여자</th>
                    <th>입장 시간</th>
                    <th>응답 상태</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="participant in participants" :key="participant.id">
                    <td>
                      <div class="participant-table-name">
                        <span class="participant-avatar">{{
                          participant.nickname.slice(0, 1)
                        }}</span
                        ><strong>{{ participant.nickname }}</strong>
                      </div>
                    </td>
                    <td>{{ participant.joinedAt }}</td>
                    <td>
                      <span
                        class="response-state"
                        :class="
                          participant.submitted ? 'is-submitted' : 'is-pending'
                        "
                        >{{
                          participant.submitted ? "응답 완료" : "미응답"
                        }}</span
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside class="manage-side">
          <section class="manage-card invite-card">
            <span class="step-label">INVITATION</span>
            <h2>참여자 초대</h2>
            <p>아래 초대 코드를 참여자에게 공유해 주세요.</p>
            <div class="invite-code">
              <strong>{{ event.inviteCode }}</strong
              ><button
                type="button"
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
          <section class="manage-card participant-card">
            <div class="participant-heading">
              <div>
                <span class="step-label">PARTICIPANTS</span>
                <h2>참여 현황</h2>
              </div>
              <span class="participant-count">{{ participantCount }}명</span>
            </div>
            <div class="participant-progress">
              <div>
                <span>응답 완료율</span><strong>{{ completionRate }}%</strong>
              </div>
              <div class="summary-progress">
                <span :style="{ width: `${completionRate}%` }"></span>
              </div>
            </div>
            <div class="participant-mini-stats">
              <div>
                <span>응답 완료</span><strong>{{ submittedCount }}명</strong>
              </div>
              <div>
                <span>미응답</span
                ><strong>{{ participantCount - submittedCount }}명</strong>
              </div>
            </div>
            <p class="participant-demo-notice">
              현재 통계와 참여자 정보는 화면 확인용 예시 데이터입니다. 실시간
              집계는 API 및 WebSocket 연결 후 제공됩니다.
            </p>
          </section>
        </aside>
      </div>
    </main>
  </div>
</template>

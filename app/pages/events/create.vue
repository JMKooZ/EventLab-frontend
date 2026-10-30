<script setup>
import { computed, ref } from "vue";

const eventTitle = ref("");
const eventDescription = ref("");
const eventType = ref("POLL");
const maxParticipants = ref(100);

const questions = ref([
  {
    id: 1,
    content: "",
    timeLimitEnabled: false,
    timeLimitSeconds: 30,
    options: [
      { id: 1, content: "" },
      { id: 2, content: "" },
    ],
    correctOptionId: null,
  },
]);

const errors = ref({});
const showPreview = ref(false);
const submitMessage = ref("");

const totalQuestions = computed(() => questions.value.length);
const isQuiz = computed(() => eventType.value === "QUIZ");

const addQuestion = () => {
  const nextId =
    Math.max(0, ...questions.value.map((question) => question.id)) + 1;

  questions.value.push({
    id: nextId,
    content: "",
    timeLimitEnabled: false,
    timeLimitSeconds: 30,
    options: [
      { id: 1, content: "" },
      { id: 2, content: "" },
    ],
    correctOptionId: null,
  });
};

const removeQuestion = (questionId) => {
  if (questions.value.length <= 1) return;

  questions.value = questions.value.filter(
    (question) => question.id !== questionId,
  );
};

const addOption = (question) => {
  if (question.options.length >= 6) return;

  const nextId =
    Math.max(0, ...question.options.map((option) => option.id)) + 1;

  question.options.push({
    id: nextId,
    content: "",
  });
};

const removeOption = (question, optionId) => {
  if (question.options.length <= 2) return;

  question.options = question.options.filter(
    (option) => option.id !== optionId,
  );

  if (question.correctOptionId === optionId) {
    question.correctOptionId = null;
  }
};

const validateForm = () => {
  const nextErrors = {};

  if (!eventTitle.value.trim()) {
    nextErrors.title = "이벤트 제목을 입력해 주세요.";
  } else if (eventTitle.value.trim().length > 100) {
    nextErrors.title = "이벤트 제목은 100자 이하로 입력해 주세요.";
  }

  if (eventDescription.value.length > 500) {
    nextErrors.description = "설명은 500자 이하로 입력해 주세요.";
  }

  if (
    !Number.isInteger(Number(maxParticipants.value)) ||
    Number(maxParticipants.value) < 1 ||
    Number(maxParticipants.value) > 100
  ) {
    nextErrors.maxParticipants =
      "참여 인원은 1명 이상 100명 이하로 설정해 주세요.";
  }

  questions.value.forEach((question, index) => {
    const number = index + 1;

    if (!question.content.trim()) {
      nextErrors[`question-${question.id}`] =
        `${number}번 질문 내용을 입력해 주세요.`;
    }

    if (
      question.timeLimitEnabled &&
      (!Number.isInteger(Number(question.timeLimitSeconds)) ||
        Number(question.timeLimitSeconds) < 5 ||
        Number(question.timeLimitSeconds) > 300)
    ) {
      nextErrors[`time-${question.id}`] =
        `${number}번 질문의 제한 시간은 5~300초로 설정해 주세요.`;
    }

    const filledOptions = question.options.filter((option) =>
      option.content.trim(),
    );

    if (
      filledOptions.length < 2 ||
      filledOptions.length !== question.options.length
    ) {
      nextErrors[`options-${question.id}`] =
        `${number}번 질문의 선택지를 모두 입력해 주세요. (최소 2개)`;
    }

    if (
      isQuiz.value &&
      !question.options.some((option) => option.id === question.correctOptionId)
    ) {
      nextErrors[`answer-${question.id}`] =
        `${number}번 질문의 정답을 선택해 주세요.`;
    }
  });

  errors.value = nextErrors;

  return Object.keys(nextErrors).length === 0;
};

const createEvent = () => {
  submitMessage.value = "";

  if (!validateForm()) {
    showPreview.value = false;

    if (import.meta.client) {
      document.querySelector(".field-error")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    return;
  }

  showPreview.value = true;
};

const confirmCreate = () => {
  const eventPayload = {
    title: eventTitle.value.trim(),
    description: eventDescription.value.trim(),
    eventType: eventType.value,
    maxParticipants: Number(maxParticipants.value),
    questions: questions.value.map((question, index) => ({
      questionOrder: index + 1,
      content: question.content.trim(),

      timeLimitEnabled: question.timeLimitEnabled,

      timeLimitSeconds: question.timeLimitEnabled
        ? Number(question.timeLimitSeconds)
        : null,

      options: question.options.map((option, optionIndex) => ({
        optionOrder: optionIndex + 1,
        content: option.content.trim(),
        isCorrect: isQuiz.value && option.id === question.correctOptionId,
      })),
    })),
  };

  submitMessage.value =
    `${eventPayload.title}의 입력 검증이 완료되었습니다. ` +
    `총 ${eventPayload.questions.length}개 질문이 구성되었습니다. ` +
    "실제 저장 기능은 백엔드 API 연결 단계에서 구현합니다.";

  showPreview.value = false;
};

const cancelPreview = () => {
  showPreview.value = false;
};
</script>

<template>
  <div class="event-create-page">
    <main class="page-container">
      <div class="create-page-heading">
        <NuxtLink to="/" class="back-link">
          <span>←</span>
          대시보드
        </NuxtLink>
      </div>
      <div class="create-title-area">
        <p class="eyebrow">CREATE NEW EVENT</p>
        <h1>새 이벤트 만들기</h1>
        <p>이벤트 정보를 입력하고 참여자에게 보여줄 질문을 구성해 보세요.</p>
      </div>

      <div class="create-layout">
        <div class="create-form">
          <!-- Event Information -->
          <section class="form-section">
            <div class="form-section-heading">
              <div>
                <span class="step-label">STEP 01</span>
                <h2>기본 정보</h2>
                <p>이벤트의 기본적인 정보를 입력해 주세요.</p>
              </div>
            </div>

            <div class="form-field">
              <label for="eventTitle">
                이벤트 제목 <span class="required">*</span>
              </label>

              <input
                id="eventTitle"
                v-model="eventTitle"
                type="text"
                maxlength="100"
                placeholder="예: 2026 하반기 개발팀 워크숍"
              />

              <p v-if="errors.title" class="field-error">
                {{ errors.title }}
              </p>
            </div>

            <div class="form-field">
              <label for="eventDescription"> 이벤트 설명 </label>

              <textarea
                id="eventDescription"
                v-model="eventDescription"
                maxlength="500"
                rows="3"
                placeholder="이벤트에 대한 간단한 설명을 입력해 주세요."
              ></textarea>

              <div class="field-guide">
                <span v-if="errors.description" class="field-error">
                  {{ errors.description }}
                </span>
                <span v-else> {{ eventDescription.length }} / 500 </span>
              </div>
            </div>

            <div class="form-field">
              <label>이벤트 유형 <span class="required">*</span></label>

              <div class="type-selector">
                <button
                  type="button"
                  class="type-option"
                  :class="{ selected: eventType === 'POLL' }"
                  @click="eventType = 'POLL'"
                >
                  <span class="type-option-icon">▤</span>
                  <span class="type-option-content">
                    <strong>설문</strong>
                    <small>참여자의 의견을 수집합니다.</small>
                  </span>
                  <span class="type-check">
                    {{ eventType === "POLL" ? "●" : "○" }}
                  </span>
                </button>

                <button
                  type="button"
                  class="type-option"
                  :class="{ selected: eventType === 'QUIZ' }"
                  @click="eventType = 'QUIZ'"
                >
                  <span class="type-option-icon">?</span>
                  <span class="type-option-content">
                    <strong>퀴즈</strong>
                    <small>정답을 맞히고 점수를 획득합니다.</small>
                  </span>
                  <span class="type-check">
                    {{ eventType === "QUIZ" ? "●" : "○" }}
                  </span>
                </button>
              </div>
            </div>

            <div class="form-field">
              <label for="maxParticipants">
                최대 참여 인원 <span class="required">*</span>
              </label>

              <div class="number-input-wrapper">
                <input
                  id="maxParticipants"
                  v-model.number="maxParticipants"
                  type="number"
                  min="1"
                  max="100"
                />
                <span>명</span>
              </div>

              <p class="field-guide">
                현재 MVP에서는 이벤트당 최대 100명까지 참여할 수 있습니다.
              </p>

              <p v-if="errors.maxParticipants" class="field-error">
                {{ errors.maxParticipants }}
              </p>
            </div>
          </section>

          <!-- Questions -->
          <section class="form-section question-section">
            <div class="form-section-heading question-heading">
              <div>
                <span class="step-label">STEP 02</span>
                <h2>질문 구성</h2>
                <p>참여자가 답변할 질문을 만들어 주세요.</p>
              </div>

              <span class="question-count"> {{ totalQuestions }}개 질문 </span>
            </div>

            <div class="question-list">
              <article
                v-for="(question, index) in questions"
                :key="question.id"
                class="question-card"
              >
                <div class="question-card-heading">
                  <div class="question-number">Q{{ index + 1 }}</div>

                  <button
                    type="button"
                    class="remove-question-button"
                    :disabled="questions.length === 1"
                    @click="removeQuestion(question.id)"
                  >
                    삭제
                  </button>
                </div>

                <div class="form-field">
                  <label :for="`question-${question.id}`">
                    질문 내용 <span class="required">*</span>
                  </label>

                  <input
                    :id="`question-${question.id}`"
                    v-model="question.content"
                    type="text"
                    maxlength="200"
                    placeholder="질문을 입력해 주세요."
                  />

                  <p
                    v-if="errors[`question-${question.id}`]"
                    class="field-error"
                  >
                    {{ errors[`question-${question.id}`] }}
                  </p>
                </div>

                <div class="form-field">
                  <div class="option-heading">
                    <label>선택지 <span class="required">*</span></label>
                    <span>{{ question.options.length }} / 6</span>
                  </div>

                  <div class="option-list">
                    <div
                      v-for="(option, optionIndex) in question.options"
                      :key="option.id"
                      class="option-row"
                    >
                      <span class="option-number">
                        {{ optionIndex + 1 }}
                      </span>

                      <input
                        v-model="option.content"
                        type="text"
                        maxlength="100"
                        :placeholder="`선택지 ${optionIndex + 1}`"
                      />

                      <button
                        type="button"
                        class="remove-option-button"
                        :disabled="question.options.length <= 2"
                        aria-label="선택지 삭제"
                        @click="removeOption(question, option.id)"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <p
                    v-if="errors[`options-${question.id}`]"
                    class="field-error"
                  >
                    {{ errors[`options-${question.id}`] }}
                  </p>

                  <button
                    type="button"
                    class="add-option-button"
                    :disabled="question.options.length >= 6"
                    @click="addOption(question)"
                  >
                    ＋ 선택지 추가
                  </button>
                </div>

                <div v-if="isQuiz" class="form-field answer-field">
                  <label> 정답 선택 <span class="required">*</span> </label>

                  <div class="answer-list">
                    <label
                      v-for="(option, optionIndex) in question.options"
                      :key="option.id"
                      class="answer-option"
                      :class="{
                        selected: question.correctOptionId === option.id,
                      }"
                    >
                      <input
                        v-model="question.correctOptionId"
                        type="radio"
                        :name="`answer-${question.id}`"
                        :value="option.id"
                      />

                      <span>{{ optionIndex + 1 }}번 선택지</span>
                    </label>
                  </div>

                  <p v-if="errors[`answer-${question.id}`]" class="field-error">
                    {{ errors[`answer-${question.id}`] }}
                  </p>
                </div>

                <!-- 답변 제한 시간 -->
                <div class="form-field time-field">
                  <div class="time-field-header">
                    <span class="time-field-title">답변 제한 시간</span>

                    <label class="time-toggle">
                      <input
                        v-model="question.timeLimitEnabled"
                        type="checkbox"
                      />
                      <span>{{
                        question.timeLimitEnabled ? "미사용" : "사용"
                      }}</span>
                    </label>
                  </div>

                  <div
                    v-if="question.timeLimitEnabled"
                    class="number-input-wrapper time-input"
                  >
                    <input
                      v-model.number="question.timeLimitSeconds"
                      type="number"
                      min="5"
                      max="300"
                      placeholder="30"
                    />
                    <span>초</span>
                  </div>

                  <p v-if="question.timeLimitEnabled" class="time-guide">
                    5~300초 사이로 설정해 주세요.
                  </p>

                  <p v-else class="time-guide">
                    제한 시간 없이 답변을 받을 수 있습니다.
                  </p>

                  <p v-if="errors[`time-${question.id}`]" class="field-error">
                    {{ errors[`time-${question.id}`] }}
                  </p>
                </div>
              </article>
            </div>

            <button
              type="button"
              class="add-question-button"
              @click="addQuestion"
            >
              <span>＋</span>
              질문 추가하기
            </button>
          </section>

          <!-- Submit -->
          <div class="submit-area">
            <p v-if="submitMessage" class="submit-message">
              {{ submitMessage }}
            </p>

            <NuxtLink to="/" class="secondary-button cancel-button">
              취소
            </NuxtLink>

            <button
              type="button"
              class="primary-button submit-button"
              @click="createEvent"
            >
              이벤트 생성 확인
              <span>→</span>
            </button>
          </div>
        </div>

        <!-- Side Guide -->
        <aside class="create-guide">
          <div class="guide-card">
            <span class="guide-icon">✦</span>
            <h3>이벤트 생성 안내</h3>
            <p>
              간단한 설정만으로 참여자들이 함께할 수 있는 이벤트를 만들 수
              있습니다.
            </p>

            <div class="guide-item">
              <span class="guide-dot"></span>
              <div>
                <strong>이벤트 유형</strong>
                <p>설문 또는 퀴즈 중 하나를 선택합니다.</p>
              </div>
            </div>

            <div class="guide-item">
              <span class="guide-dot"></span>
              <div>
                <strong>질문 구성</strong>
                <p>질문마다 2~6개의 선택지를 설정할 수 있습니다.</p>
              </div>
            </div>

            <div class="guide-item">
              <span class="guide-dot"></span>
              <div>
                <strong>참여 인원</strong>
                <p>최대 100명까지 참여할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="modal-backdrop" @click.self="cancelPreview">
      <section
        class="preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
      >
        <div class="preview-modal-heading">
          <span class="preview-icon">✓</span>
          <h2 id="preview-title">이벤트 생성 내용 확인</h2>
          <p>입력한 내용을 확인해 주세요.</p>
        </div>

        <div class="preview-content">
          <div class="preview-row">
            <span>이벤트 제목</span>
            <strong>{{ eventTitle }}</strong>
          </div>

          <div class="preview-row">
            <span>유형</span>
            <strong>{{ isQuiz ? "퀴즈" : "설문" }}</strong>
          </div>

          <div class="preview-row">
            <span>최대 참여 인원</span>
            <strong>{{ maxParticipants }}명</strong>
          </div>

          <div class="preview-row">
            <span>질문 수</span>
            <strong>{{ totalQuestions }}개</strong>
          </div>
        </div>

        <div class="preview-question-list">
          <strong>질문 목록</strong>

          <ol>
            <li v-for="(question, index) in questions" :key="question.id">
              {{ index + 1 }}. {{ question.content }}
            </li>
          </ol>
        </div>

        <p class="preview-notice">
          현재는 화면 검증 단계입니다. 실제 저장은 백엔드 API 연결 후
          가능합니다.
        </p>

        <div class="preview-actions">
          <button type="button" class="secondary-button" @click="cancelPreview">
            수정하기
          </button>

          <button type="button" class="primary-button" @click="confirmCreate">
            확인 완료
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const eventTitle = ref("");
const eventDescription = ref("");
const maxParticipants = ref(100);

const QUESTION_TYPES = [
  {
    value: "SINGLE_CHOICE",
    label: "단일 선택",
    description: "하나의 항목을 선택합니다.",
  },
  {
    value: "MULTIPLE_CHOICE",
    label: "다중 선택",
    description: "여러 항목을 선택합니다.",
  },
  {
    value: "SHORT_TEXT",
    label: "단답형",
    description: "짧은 텍스트로 답변합니다.",
  },
  {
    value: "LONG_TEXT",
    label: "장문형",
    description: "자유롭게 의견을 작성합니다.",
  },
  {
    value: "RATING",
    label: "척도형",
    description: "숫자 범위에서 점수를 선택합니다.",
  },
];

const createQuestion = (id) => ({
  id,
  content: "",
  questionType: "SINGLE_CHOICE",
  isRequired: true,
  allowOther: false,
  timeLimitEnabled: false,
  timeLimitSeconds: 30,
  options: [
    { id: 1, content: "" },
    { id: 2, content: "" },
  ],
  maxSelections: 2,
  textMaxLength: 200,
  scaleMin: 1,
  scaleMax: 5,
  scaleMinLabel: "전혀 그렇지 않다",
  scaleMaxLabel: "매우 그렇다",
});

const questions = ref([createQuestion(1)]);
const errors = ref({});
const showPreview = ref(false);
const submitMessage = ref("");

const totalQuestions = computed(() => questions.value.length);
const getQuestionTypeLabel = (type) =>
  QUESTION_TYPES.find((item) => item.value === type)?.label ?? "질문";
const isChoiceQuestion = (question) =>
  ["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(question.questionType);

const addQuestion = () => {
  const nextId =
    Math.max(0, ...questions.value.map((question) => question.id)) + 1;
  questions.value.push(createQuestion(nextId));
};

const removeQuestion = (questionId) => {
  if (questions.value.length <= 1) return;
  questions.value = questions.value.filter(
    (question) => question.id !== questionId,
  );
};

const changeQuestionType = (question) => {
  question.allowOther = false;
  if (question.questionType === "SINGLE_CHOICE") question.maxSelections = 1;
  if (question.questionType === "MULTIPLE_CHOICE") {
    question.maxSelections = Math.min(
      Math.max(question.maxSelections, 2),
      question.options.length,
    );
  }
};

const addOption = (question) => {
  if (question.options.length >= 6) return;
  const nextId =
    Math.max(0, ...question.options.map((option) => option.id)) + 1;
  question.options.push({ id: nextId, content: "" });
  if (question.questionType === "MULTIPLE_CHOICE") {
    question.maxSelections = Math.min(
      question.maxSelections + 1,
      question.options.length,
    );
  }
};

const removeOption = (question, optionId) => {
  if (question.options.length <= 2) return;
  question.options = question.options.filter(
    (option) => option.id !== optionId,
  );
  question.maxSelections = Math.min(
    question.maxSelections,
    question.options.length,
  );
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

    if (isChoiceQuestion(question)) {
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
        question.questionType === "MULTIPLE_CHOICE" &&
        (!Number.isInteger(Number(question.maxSelections)) ||
          question.maxSelections < 1 ||
          question.maxSelections > question.options.length)
      ) {
        nextErrors[`max-selections-${question.id}`] =
          `${number}번 질문의 최대 선택 개수를 확인해 주세요.`;
      }
    }

    if (
      ["SHORT_TEXT", "LONG_TEXT"].includes(question.questionType) &&
      (!Number.isInteger(Number(question.textMaxLength)) ||
        question.textMaxLength < 1 ||
        question.textMaxLength >
          (question.questionType === "SHORT_TEXT" ? 500 : 5000))
    ) {
      nextErrors[`text-length-${question.id}`] =
        `${number}번 질문의 글자 수 제한을 확인해 주세요.`;
    }

    if (
      question.questionType === "RATING" &&
      (!Number.isInteger(Number(question.scaleMin)) ||
        !Number.isInteger(Number(question.scaleMax)) ||
        Number(question.scaleMin) >= Number(question.scaleMax) ||
        Number(question.scaleMax) - Number(question.scaleMin) > 9)
    ) {
      nextErrors[`scale-${question.id}`] =
        `${number}번 질문의 척도 범위를 확인해 주세요. (최대 10단계)`;
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
      document
        .querySelector(".field-error")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }
  showPreview.value = true;
};

const confirmCreate = () => {
  // 백엔드 API 연결 시 이 데이터 구조를 요청 DTO에 맞춰 전송합니다.
  const eventPayload = {
    title: eventTitle.value.trim(),
    description: eventDescription.value.trim(),
    maxParticipants: Number(maxParticipants.value),
    questions: questions.value.map((question, index) => ({
      questionOrder: index + 1,
      content: question.content.trim(),
      questionType: question.questionType,
      isRequired: question.isRequired,
      timeLimitSeconds: question.timeLimitEnabled
        ? Number(question.timeLimitSeconds)
        : null,
      options: isChoiceQuestion(question)
        ? question.options
            .map((option, optionIndex) => ({
              optionOrder: optionIndex + 1,
              content: option.content.trim(),
              isOther: false,
            }))
            .concat(
              question.allowOther
                ? [
                    {
                      optionOrder: question.options.length + 1,
                      content: "기타",
                      isOther: true,
                    },
                  ]
                : [],
            )
        : [],
      maxSelections:
        question.questionType === "MULTIPLE_CHOICE"
          ? Number(question.maxSelections)
          : null,
      textMaxLength: ["SHORT_TEXT", "LONG_TEXT"].includes(question.questionType)
        ? Number(question.textMaxLength)
        : null,
      scale:
        question.questionType === "RATING"
          ? {
              min: Number(question.scaleMin),
              max: Number(question.scaleMax),
              minLabel: question.scaleMinLabel.trim(),
              maxLabel: question.scaleMaxLabel.trim(),
            }
          : null,
    })),
  };

  submitMessage.value = `${eventPayload.title}의 입력 검증이 완료되었습니다. 총 ${eventPayload.questions.length}개 질문이 구성되었습니다. 실제 저장 기능은 백엔드 API 연결 단계에서 구현합니다.`;
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
        <NuxtLink to="/" class="back-link"><span>←</span> 대시보드</NuxtLink>
      </div>

      <div class="create-title-area">
        <p class="eyebrow">CREATE NEW EVENT</p>
        <h1>새 이벤트 만들기</h1>
        <p>이벤트 정보를 입력하고 참여자에게 보여줄 질문을 구성해 보세요.</p>
      </div>

      <div class="create-layout">
        <div class="create-form">
          <section class="form-section">
            <div class="form-section-heading">
              <div>
                <span class="step-label">STEP 01</span>
                <h2>기본 정보</h2>
                <p>이벤트의 기본적인 정보를 입력해 주세요.</p>
              </div>
            </div>

            <div class="form-field">
              <label for="eventTitle"
                >이벤트 제목 <span class="required">*</span></label
              >
              <input
                id="eventTitle"
                v-model="eventTitle"
                type="text"
                maxlength="100"
                placeholder="예: 2026 하반기 개발팀 워크숍"
              />
              <p v-if="errors.title" class="field-error">{{ errors.title }}</p>
            </div>

            <div class="form-field">
              <label for="eventDescription">이벤트 설명</label>
              <textarea
                id="eventDescription"
                v-model="eventDescription"
                maxlength="500"
                rows="3"
                placeholder="이벤트에 대한 간단한 설명을 입력해 주세요."
              ></textarea>
              <div class="field-guide">
                <span v-if="errors.description" class="field-error">{{
                  errors.description
                }}</span>
                <span v-else>{{ eventDescription.length }} / 500</span>
              </div>
            </div>

            <div class="form-field">
              <label for="maxParticipants"
                >최대 참여 인원 <span class="required">*</span></label
              >
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

          <section class="form-section question-section">
            <div class="form-section-heading question-heading">
              <div>
                <span class="step-label">STEP 02</span>
                <h2>질문 구성</h2>
                <p>
                  하나의 이벤트에 여러 유형의 질문을 함께 구성할 수 있습니다.
                </p>
              </div>
              <span class="question-count">{{ totalQuestions }}개 질문</span>
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
                  <label :for="`question-${question.id}`"
                    >질문 내용 <span class="required">*</span></label
                  >
                  <input
                    :id="`question-${question.id}`"
                    v-model="question.content"
                    type="text"
                    maxlength="300"
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
                  <label :for="`question-type-${question.id}`"
                    >질문 유형 <span class="required">*</span></label
                  >
                  <select
                    :id="`question-type-${question.id}`"
                    v-model="question.questionType"
                    class="question-type-select"
                    @change="changeQuestionType(question)"
                  >
                    <option
                      v-for="type in QUESTION_TYPES"
                      :key="type.value"
                      :value="type.value"
                    >
                      {{ type.label }}
                    </option>
                  </select>
                  <p class="type-description">
                    {{
                      QUESTION_TYPES.find(
                        (type) => type.value === question.questionType,
                      )?.description
                    }}
                  </p>
                </div>

                <div v-if="isChoiceQuestion(question)" class="form-field">
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
                      <span class="option-number">{{ optionIndex + 1 }}</span>
                      <input
                        v-model="option.content"
                        type="text"
                        maxlength="200"
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
                  <div class="option-actions">
                    <button
                      type="button"
                      class="add-option-button"
                      :disabled="question.options.length >= 6"
                      @click="addOption(question)"
                    >
                      ＋ 선택지 추가
                    </button>

                    <label class="inline-toggle other-toggle">
                      <input v-model="question.allowOther" type="checkbox" />
                      <span>기타 응답 허용</span>
                    </label>
                  </div>

                  <div
                    v-if="question.questionType === 'MULTIPLE_CHOICE'"
                    class="setting-field"
                  >
                    <label :for="`max-selections-${question.id}`"
                      >최대 선택 개수</label
                    >
                    <div class="number-input-wrapper compact-number-input">
                      <input
                        :id="`max-selections-${question.id}`"
                        v-model.number="question.maxSelections"
                        type="number"
                        min="1"
                        :max="question.options.length"
                      />
                      <span>개</span>
                    </div>
                    <p
                      v-if="errors[`max-selections-${question.id}`]"
                      class="field-error"
                    >
                      {{ errors[`max-selections-${question.id}`] }}
                    </p>
                  </div>
                </div>

                <div
                  v-else-if="
                    ['SHORT_TEXT', 'LONG_TEXT'].includes(question.questionType)
                  "
                  class="form-field setting-field"
                >
                  <label :for="`text-length-${question.id}`"
                    >최대 글자 수</label
                  >
                  <div class="number-input-wrapper compact-number-input">
                    <input
                      :id="`text-length-${question.id}`"
                      v-model.number="question.textMaxLength"
                      type="number"
                      min="1"
                      :max="question.questionType === 'SHORT_TEXT' ? 500 : 5000"
                    />
                    <span>자</span>
                  </div>
                  <p class="field-guide">
                    {{
                      question.questionType === "SHORT_TEXT"
                        ? "1~500자까지 입력할 수 있습니다."
                        : "1~5,000자까지 입력할 수 있습니다."
                    }}
                  </p>
                  <p
                    v-if="errors[`text-length-${question.id}`]"
                    class="field-error"
                  >
                    {{ errors[`text-length-${question.id}`] }}
                  </p>
                </div>

                <div
                  v-else-if="question.questionType === 'RATING'"
                  class="form-field rating-setting"
                >
                  <div class="rating-range-fields">
                    <div class="setting-field">
                      <label :for="`scale-min-${question.id}`">최솟값</label>
                      <input
                        :id="`scale-min-${question.id}`"
                        v-model.number="question.scaleMin"
                        type="number"
                        min="0"
                        max="9"
                      />
                    </div>
                    <span class="range-separator">~</span>
                    <div class="setting-field">
                      <label :for="`scale-max-${question.id}`">최댓값</label>
                      <input
                        :id="`scale-max-${question.id}`"
                        v-model.number="question.scaleMax"
                        type="number"
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>
                  <div class="rating-label-fields">
                    <div class="setting-field">
                      <label :for="`scale-min-label-${question.id}`"
                        >최솟값 설명</label
                      >
                      <input
                        :id="`scale-min-label-${question.id}`"
                        v-model="question.scaleMinLabel"
                        type="text"
                        maxlength="50"
                        placeholder="예: 전혀 그렇지 않다"
                      />
                    </div>
                    <div class="setting-field">
                      <label :for="`scale-max-label-${question.id}`"
                        >최댓값 설명</label
                      >
                      <input
                        :id="`scale-max-label-${question.id}`"
                        v-model="question.scaleMaxLabel"
                        type="text"
                        maxlength="50"
                        placeholder="예: 매우 그렇다"
                      />
                    </div>
                  </div>
                  <p v-if="errors[`scale-${question.id}`]" class="field-error">
                    {{ errors[`scale-${question.id}`] }}
                  </p>
                </div>

                <div class="question-common-settings">
                  <label class="inline-toggle">
                    <input v-model="question.isRequired" type="checkbox" />
                    <span>필수 응답</span>
                  </label>
                </div>

                <div class="form-field time-field">
                  <div class="time-field-header">
                    <span class="time-field-title">답변 제한 시간</span>
                    <label class="time-toggle">
                      <input
                        v-model="question.timeLimitEnabled"
                        type="checkbox"
                      />
                      <span>제한 시간 사용</span>
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
              <span>＋</span> 질문 추가하기
            </button>
          </section>

          <div class="submit-area">
            <p v-if="submitMessage" class="submit-message">
              {{ submitMessage }}
            </p>
            <NuxtLink to="/" class="secondary-button cancel-button"
              >취소</NuxtLink
            >
            <button
              type="button"
              class="primary-button submit-button"
              @click="createEvent"
            >
              이벤트 생성 확인 <span>→</span>
            </button>
          </div>
        </div>

        <aside class="create-guide">
          <div class="guide-card">
            <span class="guide-icon">✦</span>
            <h3>이벤트 생성 안내</h3>
            <p>다양한 질문 유형을 조합해 참여자의 의견을 수집할 수 있습니다.</p>
            <div class="guide-item">
              <span class="guide-dot"></span>
              <div>
                <strong>질문 유형</strong>
                <p>
                  단일 선택, 다중 선택, 단답형, 장문형, 척도형을 지원합니다.
                </p>
              </div>
            </div>
            <div class="guide-item">
              <span class="guide-dot"></span>
              <div>
                <strong>질문 구성</strong>
                <p>
                  한 이벤트 안에 서로 다른 유형의 질문을 함께 추가할 수
                  있습니다.
                </p>
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
            <span>이벤트 제목</span><strong>{{ eventTitle }}</strong>
          </div>
          <div class="preview-row">
            <span>최대 참여 인원</span><strong>{{ maxParticipants }}명</strong>
          </div>
          <div class="preview-row">
            <span>질문 수</span><strong>{{ totalQuestions }}개</strong>
          </div>
        </div>
        <div class="preview-question-list">
          <strong>질문 목록</strong>
          <ol>
            <li v-for="(question, index) in questions" :key="question.id">
              <strong>{{ getQuestionTypeLabel(question.questionType) }}</strong>
              · {{ question.content }}
              <small v-if="question.isRequired">필수 응답</small
              ><small v-else>선택 응답</small>
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

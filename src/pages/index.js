import { enableValidation, settings } from "../scripts/validation.js";
import { disableButton } from "../scripts/validation.js";
import { resetValidation } from "../scripts/validation.js";
import "./index.css";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "2cb98e9e-81e4-4b00-a170-02868e028d5f",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, userData]) => {
    cards.forEach((card) => {
      const cardElement = getCardElement(card);
      cardsList.prepend(cardElement);
    });
    const profileAvatar = document.querySelector(".profile__image");
    profileAvatar.src = userData.avatar;
    profileName.textContent = userData.name;
    profileDescription.textContent = userData.about;
  })
  .catch(console.error);

const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const profileEditButton = document.querySelector(".profile__edit-button");
const profileAddButton = document.querySelector(".profile__add-button");

const editModal = document.querySelector("#edit-modal");
const nameModalInput = editModal.querySelector("#profile-name-input");
const descriptionModalInput = editModal.querySelector(
  "#profile-description-input"
);
const deleteModal = document.querySelector("#delete-card-modal");
const deleteModalConfirmation = deleteModal.querySelector(
  ".modal__submit-button"
);
const deleteModalCloseButton = deleteModal.querySelector(
  ".modal__close-button"
);
const cancelButton = deleteModal.querySelector(".modal__cancel-button");

const avatarModalButton = document.querySelector(".profile__avatar-btn");
const profileCloseButton = editModal.querySelector(".modal__close-button");
const editFormElement = editModal.querySelector(".modal__form");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

const cardModal = document.querySelector("#add-card-modal");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-button");
const cardSubmitBtn = cardModal.querySelector(".modal__submit-button");

const cardForm = cardModal.querySelector(".modal__form");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previewModalCloseBtn = previewModal.querySelector(
  ".modal__close-button_type_preview"
);

const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-button");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-button");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

let currentCardToDelete = null;

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  cardElement.dataset.cardId = data._id;

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeButton = cardElement.querySelector(".card__like-button");
  const cardDeleteButton = cardElement.querySelector(".card__delete-button");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  cardLikeButton.addEventListener("click", () => {
    const isLiked = cardLikeButton.classList.contains(
      "card__like-button_liked"
    );
    const cardId = cardElement.dataset.cardId;

    if (isLiked) {
      api
        .removeLike(cardId)
        .then(() => {
          cardLikeButton.classList.remove("card__like-button_liked");
        })
        .catch(console.error);
    } else {
      api
        .addLike(cardId)
        .then(() => {
          cardLikeButton.classList.add("card__like-button_liked");
        })
        .catch(console.error);
    }
  });

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaptionEl.textContent = data.name;
  });

  cardDeleteButton.addEventListener("click", () => {
    openModal(deleteModal);
    deleteModal.dataset.cardToDelete = data._id;
  });

  return cardElement;
}

function handleEscClose(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscClose);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscClose);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  submitBtn.textContent = "Saving...";
  api
    .editUserInfo({
      name: nameModalInput.value,
      about: descriptionModalInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = "Save";
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const name = cardNameInput.value;
  const link = cardLinkInput.value;
  const submitBtn = evt.submitter;
  submitBtn.textContent = "Saving...";
  api
    .addNewCard({ name, link })
    .then((data) => {
      const cardElement = getCardElement(data);
      cardsList.prepend(cardElement);
      evt.target.reset();
      disableButton(cardSubmitBtn, settings);
      closeModal(cardModal);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = "Save";
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  submitBtn.textContent = "Saving...";
  api
    .updateAvatar(avatarInput.value)
    .then((data) => {
      if (data.avatar) {
        const avatar = document.querySelector(".profile__image");
        avatar.src = data.avatar;
        closeModal(avatarModal);
        avatarForm.reset();
      }
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = "Save";
    });
}

profileEditButton.addEventListener("click", (config) => {
  nameModalInput.value = profileName.textContent;
  descriptionModalInput.value = profileDescription.textContent;
  resetValidation(
    editFormElement,
    [nameModalInput, descriptionModalInput],
    settings
  );
  openModal(editModal);
});

profileCloseButton.addEventListener("click", () => {
  closeModal(editModal);
});

profileAddButton.addEventListener("click", () => {
  openModal(cardModal);
});

cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});

previewModalCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});

editModal.addEventListener("mousedown", (evt) => {
  if (evt.target === editModal) {
    closeModal(editModal);
  }
});

cardModal.addEventListener("mousedown", (evt) => {
  if (evt.target === cardModal) {
    closeModal(cardModal);
  }
});

previewModal.addEventListener("mousedown", (evt) => {
  if (evt.target.classList.contains("modal__content_type_preview")) {
    closeModal(previewModal);
  }
});

deleteModalConfirmation.addEventListener("click", (evt) => {
  evt.preventDefault();
  const submitBtn = evt.target;
  submitBtn.textContent = "Deleting...";
  const cardId = deleteModal.dataset.cardToDelete;
  const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
  api
    .deleteCard(cardId)
    .then(() => {
      cardElement.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = "Delete";
    });
});

deleteModalCloseButton.addEventListener("click", () => {
  closeModal(deleteModal);
});

deleteModal.addEventListener("mousedown", (evt) => {
  if (evt.target === deleteModal) {
    closeModal(deleteModal);
  }
});

cancelButton.addEventListener("click", () => {
  closeModal(deleteModal);
});

avatarModalButton.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", (evt) => {
  closeModal(avatarModal);
});

avatarModal.addEventListener("mousedown", (evt) => {
  if (evt.target === avatarModal) {
    closeModal(avatarModal);
  }
});

avatarForm.addEventListener("submit", handleAvatarSubmit);

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);

enableValidation(settings);

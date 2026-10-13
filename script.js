const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-navigation");

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Buka navigasi" : "Tutup navigasi");
  navigation.classList.toggle("is-open", !isExpanded);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Buka navigasi");
    navigation.classList.remove("is-open");
  }
});

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("p");

document.querySelectorAll(".photo-button").forEach((button) => {
  button.addEventListener("click", () => {
    lightboxImage.src = button.dataset.photo;
    lightboxImage.alt = button.dataset.alt;
    lightboxCaption.textContent = button.dataset.alt;
    lightbox.showModal();
  });
});

lightbox.querySelector(".lightbox-close").addEventListener("click", () => {
  lightbox.close();
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.close();
  }
});

const reviewForm = document.querySelector("#review-form");
const reviewName = document.querySelector("#review-name");
const reviewMessage = document.querySelector("#review-message");
const reviewSubmit = document.querySelector("#review-submit");
const reviewStatus = document.querySelector("#review-status");
const reviewList = document.querySelector("#review-list");
const reviewListStatus = document.querySelector("#review-list-status");
const reviewCharacterCount = document.querySelector("#review-character-count");
const localRatingKey = "naureen-local-rating";
const localReviewsKey = "naureen-local-reviews";
const ratingStorageNotice = document.querySelector("#rating-storage-notice");
const ratingAverage = document.querySelector("#rating-average");
const ratingDisplay = document.querySelector("#rating-display");
const ratingCount = document.querySelector("#rating-count");
const ratingChoiceLabel = document.querySelector("#rating-choice-label");
const starChoices = [...document.querySelectorAll(".star-choice")];
const visitorIdKey = "naureen-rating-visitor-id";
const submittedKey = "naureen-rating-submitted";
const ratingLabels = ["Kurang berkesan", "Bisa lebih baik", "Cukup menyenangkan", "Menyenangkan", "Istimewa!"];
let selectedRating = 0;
let ratingClient;
let localMode = false;
let onlineReady = false;

function showReviewStatus(message, type = "") {
  reviewStatus.textContent = message;
  reviewStatus.classList.toggle("is-error", type === "error");
  reviewStatus.classList.toggle("is-success", type === "success");
}

function renderRatingSummary(average, count) {
  const numericAverage = Number(average) || 0;
  const numericCount = Number(count) || 0;
  const filledStars = Math.round(numericAverage);

  ratingAverage.textContent = numericCount ? numericAverage.toFixed(1) : "—";
  ratingDisplay.textContent = `${"★".repeat(filledStars)}${"☆".repeat(5 - filledStars)}`;
  ratingDisplay.setAttribute(
    "aria-label",
    numericCount ? `Rata-rata ${numericAverage.toFixed(1)} dari 5 bintang` : "Belum ada rating",
  );
  ratingCount.textContent = `${new Intl.NumberFormat("id-ID").format(numericCount)} rating`;
}

function getLocalReviews() {
  const savedReviews = localStorage.getItem(localReviewsKey);
  if (!savedReviews) {
    return [];
  }

  const reviews = JSON.parse(savedReviews);
  if (!Array.isArray(reviews)) {
    throw new Error("Data ulasan lokal tidak valid.");
  }
  return reviews;
}

function renderReviewList(reviews, localOnly = localMode) {
  reviewList.replaceChildren();

  for (const review of reviews) {
    const item = document.createElement("li");
    item.className = "review-card";

    const header = document.createElement("div");
    header.className = "review-card-header";

    const name = document.createElement("strong");
    name.className = "review-card-name";
    name.textContent = review.visitor_name || "Pengunjung";
    header.append(name);

    if (Number.isInteger(Number(review.stars)) && Number(review.stars) >= 1 && Number(review.stars) <= 5) {
      const stars = document.createElement("span");
      stars.className = "review-card-stars";
      stars.setAttribute("aria-label", `${review.stars} dari 5 bintang`);
      stars.textContent = `${"★".repeat(Number(review.stars))}${"☆".repeat(5 - Number(review.stars))}`;
      header.append(stars);
    }

    const date = document.createElement("time");
    const createdAt = new Date(review.created_at);
    if (Number.isNaN(createdAt.getTime())) {
      throw new Error("Tanggal ulasan tidak valid.");
    }
    date.dateTime = createdAt.toISOString();
    date.textContent = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(createdAt);

    const message = document.createElement("p");
    message.textContent = review.message;
    item.append(header, date, message);
    reviewList.append(item);
  }

  reviewListStatus.textContent = reviews.length
    ? `${new Intl.NumberFormat("id-ID").format(reviews.length)} ulasan${localOnly ? " hanya di browser ini" : " terbaru"}`
    : "Belum ada ulasan. Jadilah yang pertama berbagi cerita.";
  reviewListStatus.classList.remove("is-error");
}

function updateStarSelection(stars) {
  selectedRating = stars;
  starChoices.forEach((button) => {
    const selected = Number(button.dataset.rating) <= stars;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(Number(button.dataset.rating) === stars));
  });
  ratingChoiceLabel.textContent = stars
    ? `${stars} bintang — ${ratingLabels[stars - 1]}`
    : "Pilih jumlah bintang";
  updateSubmitAvailability();
}

function updateSubmitAvailability() {
  reviewSubmit.disabled =
    (!onlineReady && !localMode) ||
    !reviewName.value.trim() ||
    reviewMessage.value.trim().length < 10;
}

function previewStarSelection(stars) {
  starChoices.forEach((button) => {
    button.classList.toggle("is-preview", Number(button.dataset.rating) <= stars);
  });
  ratingChoiceLabel.textContent = `${stars} bintang — ${ratingLabels[stars - 1]}`;
}

function restoreStarSelection() {
  starChoices.forEach((button) => button.classList.remove("is-preview"));
  ratingChoiceLabel.textContent = selectedRating
    ? `${selectedRating} bintang — ${ratingLabels[selectedRating - 1]}`
    : "Pilih jumlah bintang";
}

starChoices.forEach((button) => {
  button.addEventListener("click", () => updateStarSelection(Number(button.dataset.rating)));
  button.addEventListener("pointerenter", () => previewStarSelection(Number(button.dataset.rating)));
  button.addEventListener("focus", () => previewStarSelection(Number(button.dataset.rating)));
  button.addEventListener("blur", restoreStarSelection);
});

async function loadReviews() {
  try {
    const reviews = [];
    let beforeCreatedAt = null;
    let beforeId = null;
    const pageSize = 500;
    while (true) {
      const { data, error } = await ratingClient.rpc("get_garden_reviews", {
        p_before_created_at: beforeCreatedAt,
        p_before_id: beforeId,
        p_limit: pageSize,
      });
      if (error) {
        throw error;
      }
      reviews.push(...data);
      if (data.length < pageSize) {
        break;
      }
      beforeCreatedAt = data[data.length - 1].created_at;
      beforeId = data[data.length - 1].id;
    }
    renderReviewList(reviews);
    return true;
  } catch (error) {
    console.error("Gagal memuat ulasan pengunjung:", error);
    reviewListStatus.textContent = "Ulasan gagal dimuat. Coba muat ulang halaman.";
    reviewListStatus.classList.add("is-error");
    return false;
  }
}

function initializeLocalReviews() {
  localMode = true;
  ratingStorageNotice.textContent =
    "Penyimpanan lokal saja: data hanya ada di browser ini dan dapat hilang. Hubungkan serta siapkan Supabase agar ulasan tersimpan online.";
  const reviews = getLocalReviews();
  renderReviewList(reviews, true);

  const savedRating = Number(localStorage.getItem(localRatingKey));
  const hasLegacyRating =
    localStorage.getItem(submittedKey) === "true" &&
    Number.isInteger(savedRating) &&
    savedRating >= 1 &&
    savedRating <= 5 &&
    !reviews.some((review) => {
      const stars = Number(review.stars);
      return Number.isInteger(stars) && stars >= 1 && stars <= 5;
    });
  const combinedRatings = reviews.map((review) => Number(review.stars)).filter((stars) => stars >= 1 && stars <= 5);
  if (hasLegacyRating) {
    combinedRatings.push(savedRating);
  }
  const average = combinedRatings.length
    ? combinedRatings.reduce((total, stars) => total + stars, 0) / combinedRatings.length
    : 0;
  renderRatingSummary(average, combinedRatings.length);

  reviewName.disabled = false;
  reviewMessage.disabled = false;
  const oldRating = Number(localStorage.getItem(localRatingKey));
  if (localStorage.getItem(submittedKey) === "true" && oldRating >= 1 && oldRating <= 5) {
    showReviewStatus("Kamu juga bisa menambahkan rating bintang, kalau mau.");
  } else {
    showReviewStatus("Isi nama dan ulasan; rating bintang boleh ditambahkan.");
  }
  updateSubmitAvailability();
}

function getVisitorId() {
  let visitorId = localStorage.getItem(visitorIdKey);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(visitorIdKey, visitorId);
  }
  return visitorId;
}

async function initializeRatings() {
  const config = window.NAUREEN_SUPABASE_CONFIG;
  onlineReady = false;
  if (
    !config ||
    !/^https:\/\/[^/]+\.supabase\.co$/.test(config.url) ||
    !config.anonKey ||
    config.anonKey.includes("PASTE_")
  ) {
    try {
      initializeLocalReviews();
    } catch (error) {
      console.error("Gagal memuat ulasan dari browser:", error);
      reviewName.disabled = true;
      reviewMessage.disabled = true;
      reviewSubmit.disabled = true;
      showReviewStatus("Data browser gagal dibaca. Periksa penyimpanan browser.", "error");
      reviewListStatus.textContent = "Ulasan gagal dimuat.";
      reviewListStatus.classList.add("is-error");
    }
    return;
  }

  try {
    const { createClient } = await import(
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
    );
    ratingClient = createClient(config.url, config.anonKey);

    const { data, error } = await ratingClient.rpc("get_garden_rating_summary");
    if (error) {
      throw error;
    }
    renderRatingSummary(data[0].average_rating, data[0].rating_count);

    reviewName.disabled = false;
    reviewMessage.disabled = false;
    if (localStorage.getItem(submittedKey) === "true") {
      showReviewStatus("Isi nama dan ulasan; rating bintang boleh ditambahkan.");
    } else {
      restoreStarSelection();
      showReviewStatus("Isi nama dan ulasan; rating bintang boleh ditambahkan.");
    }
    updateSubmitAvailability();
    if (!(await loadReviews())) {
      throw new Error("Daftar ulasan Supabase tidak dapat dimuat.");
    }
    onlineReady = true;
    updateSubmitAvailability();
    ratingStorageNotice.textContent =
      "Database online aktif. Ulasan tersimpan di Supabase dan dapat dibaca pengunjung lain. Simpan cadangan database secara berkala.";
  } catch (error) {
    console.error("Gagal memuat rating Supabase:", error);
    try {
      const localReviews = getLocalReviews();
      renderReviewList(localReviews, true);
      const localStars = localReviews
        .map((review) => Number(review.stars))
        .filter((stars) => Number.isInteger(stars) && stars >= 1 && stars <= 5);
      const localAverage = localStars.length
        ? localStars.reduce((total, stars) => total + stars, 0) / localStars.length
        : 0;
      renderRatingSummary(localAverage, localStars.length);
      reviewName.disabled = true;
      reviewMessage.disabled = true;
      reviewSubmit.disabled = true;
      ratingStorageNotice.textContent =
        "Database online belum aktif. Data lokal yang ada hanya terlihat di browser ini; pengiriman menunggu database tersambung.";
      showReviewStatus(
        "Database belum aktif. Pengelola harus menjalankan supabase-schema.sql di Supabase SQL Editor.",
        "error",
      );
      if (!localReviews.length) {
        reviewListStatus.textContent = "Ulasan online belum tersedia. Database belum disiapkan.";
        reviewListStatus.classList.add("is-error");
      }
    } catch (storageError) {
      console.error("Gagal membaca ulasan lokal saat Supabase tidak tersedia:", storageError);
      reviewName.disabled = true;
      reviewMessage.disabled = true;
      reviewSubmit.disabled = true;
      reviewListStatus.textContent = "Ulasan gagal dimuat. Database online belum siap.";
      reviewListStatus.classList.add("is-error");
      ratingStorageNotice.textContent =
        "Database online belum siap. Pengelola perlu memperbaiki Supabase sebelum ulasan dapat disimpan.";
      showReviewStatus("Penyimpanan browser juga gagal. Chat belum dapat dikirim.", "error");
    }
  }
}

reviewName.addEventListener("input", updateSubmitAvailability);
reviewMessage.addEventListener("input", () => {
  reviewCharacterCount.textContent = `${reviewMessage.value.length}/500 karakter`;
  updateSubmitAvailability();
});

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const visitorName = reviewName.value.trim();
  const message = reviewMessage.value.trim();

  if (!visitorName || visitorName.length > 40) {
    showReviewStatus("Isi nama (maksimal 40 karakter).", "error");
    reviewName.focus();
    return;
  }
  if (message.length < 10 || message.length > 500) {
    showReviewStatus("Ulasan harus berisi 10 sampai 500 karakter.", "error");
    reviewMessage.focus();
    return;
  }
  if ((!ratingClient && !localMode) || (ratingClient && !onlineReady)) {
    showReviewStatus("Database online belum aktif. Ulasan belum bisa dikirim.", "error");
    return;
  }

  reviewSubmit.disabled = true;
  showReviewStatus(localMode ? "Menyimpan ulasan di browser ini..." : "Menyimpan ulasan...");

  try {
    const review = {
      visitor_name: visitorName,
      stars: selectedRating || null,
      message,
      created_at: new Date().toISOString(),
    };

    if (localMode) {
      const reviews = getLocalReviews();
      reviews.unshift(review);
      localStorage.setItem(localReviewsKey, JSON.stringify(reviews));
      if (selectedRating) {
        localStorage.setItem(localRatingKey, String(selectedRating));
        localStorage.setItem(submittedKey, "true");
      }
      renderReviewList(getLocalReviews());
      const savedRatings = reviews
        .map((item) => Number(item.stars))
        .filter((stars) => Number.isInteger(stars) && stars >= 1 && stars <= 5);
      const average = savedRatings.length
        ? savedRatings.reduce((total, stars) => total + stars, 0) / savedRatings.length
        : 0;
      renderRatingSummary(average, savedRatings.length);
      reviewForm.reset();
      updateStarSelection(0);
      reviewCharacterCount.textContent = "0/500 karakter";
      updateSubmitAvailability();
      showReviewStatus("Terima kasih! Ulasan tersimpan di browser ini.", "success");
      return;
    }

    const { data, error } = await ratingClient.rpc("submit_garden_review", {
      p_visitor_id: getVisitorId(),
      p_visitor_name: visitorName,
      p_stars: selectedRating || null,
      p_message: message,
    });
    if (error) {
      throw error;
    }

    if (data[0].review_saved) {
      if (selectedRating) {
        localStorage.setItem(localRatingKey, String(selectedRating));
        localStorage.setItem(submittedKey, "true");
      }
      showReviewStatus("Terima kasih! Ulasanmu sudah tersimpan.", "success");
      const reviewsLoaded = await loadReviews();
      const { data: summary, error: summaryError } = await ratingClient.rpc("get_garden_rating_summary");
      if (summaryError) {
        console.error("Ulasan tersimpan, tetapi ringkasan rating gagal diperbarui:", summaryError);
      } else {
        renderRatingSummary(summary[0].average_rating, summary[0].rating_count);
      }
      reviewForm.reset();
      updateStarSelection(0);
      reviewCharacterCount.textContent = "0/500 karakter";
      updateSubmitAvailability();
      showReviewStatus(
        reviewsLoaded
          ? "Terima kasih! Ulasanmu sudah tersimpan online dan dapat dilihat pengunjung lain."
          : "Ulasanmu tersimpan online, tetapi daftar belum dapat diperbarui. Muat ulang halaman untuk melihatnya.",
        reviewsLoaded ? "success" : "error",
      );
    } else {
      reviewSubmit.disabled = false;
      showReviewStatus("Ulasan ini tidak tersimpan. Silakan coba kirim lagi.", "error");
    }
  } catch (error) {
    console.error("Gagal menyimpan rating dan ulasan:", error);
    reviewSubmit.disabled = false;
    showReviewStatus("Rating dan ulasan belum tersimpan. Periksa koneksi lalu coba lagi.", "error");
  }
});

initializeRatings();

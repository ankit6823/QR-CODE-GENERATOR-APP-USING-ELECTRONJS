console.log("this is renderer js");

var inputElements = document.querySelectorAll(
  "input:not(#searchInput)[type='text'], input[type='url'], input[type='tel'], textarea[id='sms'], textarea[type='email'], input[type ='wifi'], input[type='whatsapp'], textarea[id='whatsapp-message']:not(#searchInput)"
);

function generateQRCode() {
  let details = "";
  let qrType = "";
  for (let inputElement of inputElements) {
    if (inputElement.style.display !== "none") {
      details += inputElement.value + " \n" + "";
      if (
        inputElement.id !== "whatsapp-number" &&
        inputElement.id !== "whatsapp-message"
      ) {
        qrType = inputElement.id;
      }
    }
  }
  switch (qrType) {
    case "text":
      // do nothing, details is already in text format
      break;
    case "url":
      if (!details.startsWith("http")) {
        details = "http://" + details;
      }
      break;
    case "phone":
      details = "tel:" + details;
      break;
    case "sms":
      details = "sms:" + details;
      break;
    case "email":
      details = "mailto:" + details;
      break;
    case "wifi":
      const encryptionOptions = document.querySelectorAll(
        "input[name='encryption']"
      );
      let encryptionType = "";
      for (let encryptionOption of encryptionOptions) {
        if (encryptionOption.checked) {
          encryptionType = encryptionOption.value;
          break;
        }
      }
      if (qrType === "wifi") {
        const wifiDetails = details.split("\n");
        const ssid = wifiDetails[0];
        const password = wifiDetails[1];
        let authType = "";
        const networkType = encryptionType;
        switch (encryptionType) {
          case "none":
            authType = "nopass";
            break;
          case "wep":
            authType = "WEP";
            break;
          case "wpa":
            authType = "WPA";
            break;
          default:
            authType = "nopass";
        }
        details = `WIFI:T:${networkType};S:${ssid};P:${password};H:${authType};;`;
      }
      break;
    case "whatsapp-number || whatsapp-message":
      const whatsappDetails = details.split("\n");
      const phone = whatsappDetails[0];
      const message = whatsappDetails[1];
      details = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      break;

    default:
      console.log("Invalid type");
      break;
  }

  return {
    qrType,
    details: details.trim(),
  };
}

let checkBtnOption = () => {
  let btnArray = [
    "#Text",
    "#url",
    "#Phone",
    "#Sms",
    "#Email",
    "#Wifi",
    "#Whatsapp",
  ];
  for (let i = 0; i < btnArray.length; i++) {
    if ($(`${btnArray[i]}`).attr("data-flag") == "true") {
      return btnArray[i];
    }
  }
};

let checkInput = (dv) => {
  if (dv == "#Text") {
    if ($("#text").val().length > 0) {
      return true;
    }
  } else if (dv == "#url") {
    if ($("#website").val().length > 0) {
      return true;
    }
  } else if (dv == "#Phone") {
    if ($("#phone").val().length > 0) {
      return true;
    }
  } else if (dv == "#Sms") {
    if ($("#phone").val().length > 0 && $("#sms").val().length > 0) {
      return true;
    }
  } else if (dv == "#Email") {
    if (
      $("#phone").val().length > 0 &&
      $("#text").val().length > 0 &&
      $("#email").val().length > 0
    ) {
      return true;
    }
  } else if (dv == "#Wifi") {
    if ($("#wifi").val().length > 0 && $("#text").val().length > 0) {
      return true;
    }
  } else if (dv == "#Whatsapp") {
    if (
      $("#whatsapp-number").val().length > 0 &&
      $("#whatsapp-message").val().length > 0
    ) {
      return true;
    }
  }
};

let isInput = (dv) => {
  if (dv == "#Text") {
    if ($("#text").val().length <= 0) {
      $("#text").addClass("addOutline");
    }
  } else if (dv == "#url") {
    if ($("#website").val().length <= 0) {
      $("#website").addClass("addOutline");
    }
  } else if (dv == "#Phone") {
    if ($("#phone").val().length <= 0) {
      $("#phone").addClass("addOutline");
    }
  } else if (dv == "#Sms") {
    $("#phone").val().length <= 0 && $("#phone").addClass("addOutline");
    $("#sms").val().length <= 0 && $("#sms").addClass("addOutline");
  } else if (dv == "#Email") {
    $("#phone").val().length <= 0 && $("#phone").addClass("addOutline");
    $("#text").val().length <= 0 && $("#text").addClass("addOutline");
    $("#email").val().length <= 0 && $("#email").addClass("addOutline");
  } else if (dv == "#Wifi") {
    $("#wifi").val().length <= 0 && $("#wifi").addClass("addOutline");
    $("#text").val().length <= 0 && $("#text").addClass("addOutline");
  } else if (dv == "#Whatsapp") {
    $("#whatsapp-number").val().length <= 0 &&
      $("#whatsapp-number").addClass("addOutline");
    $("#whatsapp-message").val().length <= 0 &&
      $("#whatsapp-message").addClass("addOutline");
  }
};

$("#midContentbutton").on("click", (event) => {
  let activeBtn = checkBtnOption();
  isInput(activeBtn);
  if (checkInput(activeBtn)) {
    event.preventDefault();
    const { qrType, details } = generateQRCode();
    if (window.Bridge) {
      window.Bridge.setWebsite(details);
    }
  }
});

$("#download").on("click", (e) => {
  e.preventDefault();
  // $("#text").css("display", "block");
  const dataURL = $("#qrcode_holder").children()[0].src;
  const dataFlag = $("#qrcode_holder img").attr("data-flag");
  if (!dataFlag || !dataURL) {
    return;
  }

  window.Bridge.downloadQRCode(dataURL);
});

$("#saveQrcodeText").on("click", (e) => {
  e.preventDefault();
  // $("#text").css("display", "none");
  let SavedText = $("#qrcodeNameInput").val();
  $("#qrcodeNameInput").val("");
  const dataURL = $("#qrcode_holder").children()[0].src;
  const dataFlag = $("#qrcode_holder img").attr("data-flag");
  if (!dataFlag || !dataURL) {
    return;
  }

  if (SavedText.trim().length !== 0) {
    $("#saveQRcodeModal").modal("hide");
    window.Bridge.SaveQRCode({ text: SavedText, url: dataURL });
  }
});

$("#searchInput").on("keyup change", function (e) {
  e.preventDefault();
  let filter = $("#searchInput").val().toUpperCase();
  let searchQrCodeArr = [];
  let qrCodeItem = $(".savedQrItem");
  $(".qrCodeName").each(function (i, el) {
    searchQrCodeArr.push($(this).text());
  });
  for (let i = 0; i < searchQrCodeArr.length; i++) {
    if (searchQrCodeArr[i].toUpperCase().indexOf(filter) > -1) {
      qrCodeItem[i].style.display = "";
    } else {
      qrCodeItem[i].style.display = "none";
    }
  }
});

$(document).on("click", ".saveQrBtn", function (e) {
  e.preventDefault();
  // $("#text").css("display", "none");
  const dataURL = $(this).parent().attr("data-url");
  if (!dataURL) {
    return;
  }
  window.Bridge.downloadQRCode(dataURL);
});
$("#save").on("click", (e) => {
  e.preventDefault();
  // $("#text").css("display", "none");
  const dataFlag = $("#qrcode_holder img").attr("data-flag");
  if (!dataFlag) {
    return;
  }
  $("#saveQRcodeModal").modal("show");
});

$("#print").on("click", () => {
  const dataURL = $("#qrcode_holder").children()[0].src;
  const dataFlag = $("#qrcode_holder img").attr("data-flag");
  if (!dataFlag || !dataURL) {
    return;
  }
  var printContent = $("#qrcode_holder").prop("outerHTML");
  var originalContent = $("body").html();
  $("body").html(printContent);
  window.print();
  $("body").html(originalContent);
});

function changeBtnSrc() {
  let btnImgArray = [
    "#testImg",
    "#urlImg",
    "#phoneImg",
    "#smsImg",
    "#emailImg",
    "#wifiImg",
    "#whatsappImg",
  ];
  let btnArray = [
    "#Text",
    "#url",
    "#Phone",
    "#Sms",
    "#Email",
    "#Wifi",
    "#Whatsapp",
  ];

  let inputFields = [
    "#text",
    "#website",
    "#phone",
    "#sms",
    "#email",
    "#wifi",
    "#whatsapp-number",
    "#whatsapp-message",
  ];

  for (let i = 0; i < 7; i++) {
    $(btnImgArray[i]).attr("src", `../../assets/icons/button${i + 1}.png`);
    $(btnArray[i]).attr("data-flag", false);
    $(inputFields[i]).hasClass("addOutline") &&
      $(inputFields[i]).removeClass("addOutline");
  }
}

$("#Text").on("click", () => {
  changeBtnSrc();
  $("#testImg").attr("src", "../../assets/icons/text-hover-btn.png");
  $("#Text").attr("data-flag", true);
});

$("#url").on("click", () => {
  changeBtnSrc();
  $("#urlImg").attr("src", "../../assets/icons/url-hover-btn.png");
  $("#url").attr("data-flag", true);
});

$("#Phone").on("click", () => {
  changeBtnSrc();
  $("#phoneImg").attr("src", "../../assets/icons/phone-hover-btn.png");
  $("#Phone").attr("data-flag", true);
});

$("#Sms").on("click", () => {
  changeBtnSrc();
  $("#smsImg").attr("src", "../../assets/icons/sms-hover-btn.png");
  $("#Sms").attr("data-flag", true);
});

$("#Email").on("click", () => {
  changeBtnSrc();
  $("#emailImg").attr("src", "../../assets/icons/email-hover-btn.png");
  $("#Email").attr("data-flag", true);
});

$("#Wifi").on("click", () => {
  changeBtnSrc();
  $("#wifiImg").attr("src", "../../assets/icons/wifi-hover-btn.png");
  $("#Wifi").attr("data-flag", true);
});

$("#Whatsapp").on("click", () => {
  changeBtnSrc();
  $("#whatsappImg").attr("src", "../../assets/icons/whatsapp-hover-btn.png");
  $("#Whatsapp").attr("data-flag", true);
});

var buttons = document.querySelectorAll(".btnOptions");
var textInput = document.querySelector("#text");
var urlInput = document.querySelector("#website");
var phoneInput = document.querySelector("#phone");
var smsInput = document.querySelector("#sms");
var emailInput = document.querySelector("#email");
var wifiInput = document.querySelector("#wifi");
var label = document.getElementsByTagName("label");
var encryption = document.querySelector(".encryption-options");
encryption.style.display = "none";
var whatsapp = document.querySelector("#whatsappBox");
whatsapp.style.display = "none";
whatsapp.value = "";
label[0].style.display = "block";
label[1].style.display = "none";
label[2].style.display = "none";
label[3].style.display = "none";
label[4].style.display = "none";
label[5].style.display = "none";
textInput.style.display = "block";
urlInput.style.display = "none";
phoneInput.style.display = "none";
smsInput.style.display = "none";
emailInput.style.display = "none";
wifiInput.style.display = "none";
encryption.style.display = "none";
whatsapp.style.display = "none";

$(".btnOption").each(function (i) {
  $(this).on("click", function () {
    textInput.style.display = "none";
    urlInput.style.display = "none";
    phoneInput.style.display = "none";
    smsInput.style.display = "none";
    emailInput.style.display = "none";
    wifiInput.style.display = "none";
    encryption.style.display = "none";
    whatsapp.style.display = "none";

    if (this.id === "Text") {
      textInput.style.display = "block";
      textInput.setAttribute("type", "text");
      textInput.setAttribute("placeholder", "Enter text");
      textInput.value = "";
      label[0].textContent = "Enter Text:";
      smsInput.setAttribute("type", "hidden");
      emailInput.setAttribute("type", "hidden");
      label[0].style.display = "block";
      label[1].style.display = "none";
      label[2].style.display = "none";
      label[3].style.display = "none";
      label[4].style.display = "none";
      label[5].style.display = "none";
    } else if (this.id === "url") {
      urlInput.style.display = "block";
      urlInput.value = "";
      smsInput.setAttribute("type", "hidden");
      emailInput.setAttribute("type", "hidden");
      label[0].style.display = "none";
      label[1].style.display = "block";
      label[2].style.display = "none";
      label[3].style.display = "none";
      label[4].style.display = "none";
      label[5].style.display = "none";
    } else if (this.id === "Phone") {
      phoneInput.style.display = "block";
      phoneInput.setAttribute("type", "tel");
      phoneInput.value = "";
      label[2].textContent = "Enter Phone:";
      smsInput.setAttribute("type", "hidden");
      label[0].style.display = "none";
      label[1].style.display = "none";
      label[2].style.display = "block";
      label[3].style.display = "none";
      label[4].style.display = "none";
      label[5].style.display = "none";
    } else if (this.id === "Sms") {
      phoneInput.style.display = "block";
      phoneInput.setAttribute("type", "tel");
      phoneInput.setAttribute("placeholder", "Enter Phone");
      phoneInput.value = "";
      label[2].textContent = "Enter Phone:";
      label[2].style.display = "block";
      smsInput.style.display = "block";
      smsInput.setAttribute("type", "text");
      smsInput.value = "";
      smsInput.setAttribute("placeholder", "Enter your message");
      label[3].textContent = "Enter your message:";
      textInput.style.display = "none";
      emailInput.style.display = "none";
      label[0].style.display = "none";
      label[1].style.display = "none";
      label[3].style.display = "block";
      label[4].style.display = "none";
      label[5].style.display = "none";
    } else if (this.id === "Email") {
      /// email Address//
      textInput.style.display = "block";
      textInput.setAttribute("type", "email");
      textInput.setAttribute("placeholder", "Enter Email");
      textInput.value = "";
      label[0].textContent = "Enter Email:";
      label[0].style.display = "block";
      /// Subject//
      phoneInput.style.display = "block";
      phoneInput.setAttribute("type", "text");
      label[2].textContent = "Enter Subject:";
      label[2].style.display = "block";
      phoneInput.setAttribute("placeholder", "Enter Subject");
      phoneInput.setAttribute("overflow", "scroll");
      phoneInput.value = "";
      /// Message//
      emailInput.style.display = "block";
      emailInput.setAttribute("type", "text");
      emailInput.setAttribute("overflow", "scroll");
      label[4].textContent = "Enter Message:";
      label[4].style.display = "block";
      emailInput.setAttribute("placeholder", "Enter Message");
      emailInput.value = "";
      // emailInput.style.height = "80px";
      label[1].style.display = "none";
      label[3].style.display = "none";
      label[5].style.display = "none";
    } else if (this.id === "Wifi") {
      textInput.style.display = "block";
      textInput.setAttribute("placeholder", "Enter Wifi name");
      textInput.value = "";
      label[0].textContent = "Enter Wifi name:";
      label[0].style.display = "block";
      wifiInput.style.display = "block";
      wifiInput.value = "";
      label[5].textContent = "Enter Password:";
      label[5].style.display = "block";
      label[1].style.display = "none";
      label[2].style.display = "none";
      label[3].style.display = "none";
      label[4].style.display = "none";
      wifiInput.setAttribute("type", "text");
      wifiInput.setAttribute("placeholder", "Enter Password");
      label[2].style.display = "none";
      encryption.style.display = "block";
    } else if (this.id === "Whatsapp") {
      whatsapp.style.display = "block";
      $("#whatsapp-number").val("");
      $("#whatsapp-message").val("");
      label[0].style.display = "none";
      label[5].style.display = "none";
      label[1].style.display = "none";
      label[2].style.display = "none";
      label[3].style.display = "none";
      label[4].style.display = "none";
      label[5].style.display = "none";
    }
  });
});

if (window.Bridge) {
  window.Bridge.getSavedData();

  window.Bridge.qrdetails((event, qrcodeValue) => {
    $("#qrcode_holder").html("");
    const img = document.createElement("img");
    if (qrcodeValue) {
      img.setAttribute("src", qrcodeValue);
      img.setAttribute("data-flag", true);
    }

    $("#qrcode_holder").html(img.outerHTML);
    $("#qrcode_holder").attr("data-tag", "true");
  });

  window.Bridge.gotSavedData((event, dt) => {
    if (dt) {
      let savedQrCodeList = dt.reverse().map(
        (el) => `<div class = "savedQrItem" data-url = ${el.url}>
    <h6 class = "qrCodeName">${el.text}</h6>
    <button class= "saveQrBtn"><img src= "../../assets/icons/download-icon.png"</button>
    <div>`
      );
      $("#showQrcodeField").html("");
      $("#showQrcodeField").html(savedQrCodeList);
    } else {
      $("#showQrcodeField").html("");
      $("#showQrcodeField").html(
        `<div id= "noQrCodeText">No QR code available.</div>`
      );
    }
  });
}

$("#toggleSidebar").on("click", () => {
  $("#qrCodeSidebar").toggleClass("hidden");
  let flag = $("#toggleSidebar").attr("data-flag");
  if (flag !== "true") {
    window.Bridge.getSavedData();
  }
});
// for showing app version //
$(async () => {
  if (window.Bridge) {
    let data = await window.Bridge.getVersion();
    window.Bridge.gotVersion((event, callback) => {
      $("#version").text("QRCode" + " " + " (" + "v" + callback + ")");
    });
  }
});

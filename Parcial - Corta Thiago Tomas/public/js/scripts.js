import { Mascota } from "./entidades.js";
import { RESPONSE } from "../constates/constantes.js";
import { showSpinner, hideSpinner } from "./spinner.js";
let arrayData = [];
let selectedItem = {};

document.forms[0].addEventListener("submit", (event) => {
  event.preventDefault();
});
document.getElementById("btnGuardar").addEventListener("click", alta);
document.getElementById("btnTraer").addEventListener("click", traer);
document.getElementById("btnEliminar").addEventListener("click", baja);
document.getElementById("btnModificar").addEventListener("click", modify);
document.getElementById("btnCancelar").addEventListener("click", reset);

btnEliminar.style.visibility = "hidden";
btnModificar.style.visibility = "hidden";
function alta() {
  let xhr = new XMLHttpRequest();
  const dataToSend = getFormValues();
  if (dataToSend) {
    showSpinner();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4 || xhr.status !== 200) return;
      let dataToJson = JSON.parse(xhr.responseText);
      if (dataToJson.message === RESPONSE.ALTA_EXITOSA) {
        hideSpinner();
        traer();
      }
    };
    xhr.open("POST", "http://localhost:3000/alta");
    xhr.setRequestHeader("content-type", "application/json");
    return xhr.send(JSON.stringify(dataToSend));
  }
  console.error("Error al dar la alta, disculpa");
}

function baja() {
  let xhr = new XMLHttpRequest();
  if (selectedItem.id) {
    showSpinner();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4 || xhr.status !== 200) return;
      let dataToJson = JSON.parse(xhr.responseText);
      if (dataToJson.message === RESPONSE.BAJA_EXITOSA) {
        hideSpinner();
        traer();
      }
    };
    xhr.open("POST", "http://localhost:3000/baja");
    xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
    return xhr.send(`id=${+selectedItem.id}`);
  }
  console.error("Error no selecciono ningun elemento para dar la baja");
}

function traer() {
  reset();
  let xhr = new XMLHttpRequest();
  showSpinner();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      let response = JSON.parse(xhr.responseText);
      arrayData = response.data;
      makeTable(arrayData);
      hideSpinner();
    }
  };
  xhr.open("GET", "http://localhost:3000/traer");
  xhr.send();
}

function modify() {
  let xhr = new XMLHttpRequest();
  const formValues = getFormValues();
  if (formValues && selectedItem.id) {
    xhr.onreadystatechange = () => {
      showSpinner();
      if (xhr.readyState !== 4 || xhr.status !== 200) return;
      let dataToJson = JSON.parse(xhr.responseText);
      if (dataToJson.message === RESPONSE.MOD_EXITOSA) {
        hideSpinner();
        traer();
      }
    };
    xhr.open("POST", "http://localhost:3000/modificar");
    xhr.setRequestHeader("content-type", "application/json");
    formValues.id = selectedItem.id;
    return xhr.send(JSON.stringify(formValues));
  }
  console.error("Error al modificar, verifique los datos");
}

function makeTable(array) {
  let table = document.getElementById("table");
  table.innerHTML = "";
  table.appendChild(createHeaders(array));
  for (let item of array) {
    let row = document.createElement("tr");
    for (let property in item) {
      let cell = document.createElement("td");
      cell.addEventListener("click", getItemId);
      let text = document.createTextNode(item[property]);
      cell.appendChild(text);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

function createHeaders(array) {
  let row = document.createElement("tr");
  for (let key in array[0]) {
    let th = document.createElement("th");
    let header = document.createTextNode(key);
    th.appendChild(header);
    row.appendChild(th);
  }
  return row;
}

function getItemId(event) {
  const cell = event.target;
  const row = cell.parentNode;
  const id = row.firstElementChild.textContent;
  btnEliminar.style.visibility = "visible";
  btnModificar.style.visibility = "visible";
  setFormData(id);
}

function setFormData(id) {
  const object = arrayData.find((item) => +item.id === +id);
  selectedItem = { ...object };
  document.getElementById("titulo").value = object.titulo;
  document.getElementById("radio").checked =
    object.animal === "Perro" ? true : false;
  document.getElementById("radio2").checked =
    object.animal === "Gato" ? true : false;
  document.getElementById("descripcion").value = object.descripcion;
  let precio = object.precio.replace("$", "");
  document.getElementById("precio").value = +precio.split(",").join("");
  document.getElementById("raza").value = object.raza;
  document.getElementById("nacimiento").value = object.fecha_nacimiento;
  document.getElementById("vacunado").value = object.vacuna;
}

function getFormValues() {
  const radioPerro = document.getElementById("radio").checked;
  const radioGato = document.getElementById("radio2").checked;
  if (radioPerro || radioGato) {
    const object = {
      titulo: document.getElementById("titulo").value,
      descripcion: document.getElementById("descripcion").value,
      precio: document.getElementById("precio").value,
      animal: radioPerro ? "Perro" : "Gato",
      raza: document.getElementById("raza").value,
      fecha_nacimiento: document.getElementById("nacimiento").value,
      vacuna: document.getElementById("vacunado").value,
    };
    if (checkProperties(object)) return new Mascota(object);
  }
  console.error("Error al rellenar el formulario.");
}

function reset() {
  btnEliminar.style.visibility = "hidden";
  btnModificar.style.visibility = "hidden";
  selectedItem = {};
  document.getElementById("titulo").value = "";
  document.getElementById("radio").checked = false;
  document.getElementById("radio2").checked = false;
  document.getElementById("descripcion").value = "";
  document.getElementById("precio").value = "";
  document.getElementById("raza").value = "";
  document.getElementById("nacimiento").value = "";
  document.getElementById("vacunado").value = "elegir";
}

function checkProperties(obj) {
  for (let key in obj) {
    if (obj[key] === null || obj[key] === "" || obj[key] === "elegir")
      return false;
  }
  return true;
}

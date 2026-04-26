import jsPDF from "jspdf";

// Base64 font string
const font = "AAEAAAALAIAAAwAwT1MvMgggG2AAAC7cAAAAYGNtYXABdYk0AA..."; 
// ⚠️ Replace with your full Base64 string from the converter

// Register the font with jsPDF
(function (jsPDFAPI) {
  jsPDFAPI.addFileToVFS("NotoSansTamil-Regular.ttf", font);
  jsPDFAPI.addFont("NotoSansTamil-Regular.ttf", "NotoSansTamil", "normal");
})(jsPDF.API);

export default "NotoSansTamil";

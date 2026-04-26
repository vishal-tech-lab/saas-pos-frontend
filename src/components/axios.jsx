import axios from "axios";

const insatnces=axios.create({
    baseURL:"http://localhost:8080",
})
export default insatnces
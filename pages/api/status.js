function status(request, response) {
  response.status(200).json({ message: "a API está ok" });
}

export default status;

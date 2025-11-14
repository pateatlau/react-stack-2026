/// <reference types="vite/client" />

declare module 'authApp/Login' {
  const Login: React.ComponentType;
  export default Login;
}

declare module 'authApp/Signup' {
  const Signup: React.ComponentType;
  export default Signup;
}

declare module 'authApp/Sessions' {
  const Sessions: React.ComponentType;
  export default Sessions;
}

declare module 'todosApp/TodosREST' {
  const TodosREST: React.ComponentType;
  export default TodosREST;
}

declare module 'todosApp/TodosGraphQL' {
  const TodosGraphQL: React.ComponentType;
  export default TodosGraphQL;
}

declare module 'chatbotApp/ChatInterface' {
  const ChatInterface: React.ComponentType;
  export default ChatInterface;
}

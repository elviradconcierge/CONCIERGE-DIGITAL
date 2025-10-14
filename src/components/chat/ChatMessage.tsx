import { Message } from "../../types";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isReceived = message.type === "received";

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div
      className={`flex mb-4 ${isReceived ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-xs lg:max-w-md ${isReceived ? "order-2" : "order-1"}`}
      >
        {isReceived && (
          <div className="flex items-center mb-1">
            <span className="text-xs font-medium text-gray-600">
              {message.sender.name}
            </span>
            <span className="text-xs text-gray-400 ml-2">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}

        <div
          className={`px-4 py-2 rounded-lg ${
            isReceived ? "bg-gray-100 text-gray-900" : "bg-blue-500 text-white"
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>

        {!isReceived && (
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-400">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
      </div>

      {isReceived && (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 order-1 mr-3">
          {message.sender.avatar ? (
            <img
              src={message.sender.avatar}
              alt={message.sender.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            message.sender.name.charAt(0).toUpperCase()
          )}
        </div>
      )}
    </div>
  );
};

const NotificationService = require('./notificationService');

jest.mock('../database/repository', () => ({
  NotificationRepository: jest.fn().mockImplementation(() => ({
    GetAllNotification: jest.fn(),
    GetNotificationById: jest.fn(),
    DeleteNotification: jest.fn(),
    ReadNotification: jest.fn(),
    CreateNotification: jest.fn(),
    ReadAllNotification: jest.fn(),
  })),
}));

describe('NotificationService - GetAllNotification', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationService();
    mockRepo = service.notificationRepository;
  });

  it('Should get all notification successfully', async () => {
    mockRepo.GetAllNotification.mockResolvedValueOnce([
      { _id: 'noti1', userId: 'user1', message: 'foo' },
      { _id: 'noti2', userId: 'user1', message: 'bar' },
    ]);
    const result = await service.GetAllNotification({ id: 'user1' });

    expect(result).toHaveProperty('data');
    expect(result.data).toMatchObject([
      { _id: 'noti1', userId: 'user1', message: 'foo' },
      { _id: 'noti2', userId: 'user1', message: 'bar' },
    ]);
    expect(mockRepo.GetAllNotification).toHaveBeenCalledWith({ id: 'user1' });
  });
});

describe('NotificationService - DeleteNotification', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationService();
    mockRepo = service.notificationRepository;
  });

  it('Should throw error if no notification found', async () => {
    mockRepo.GetNotificationById.mockResolvedValue([]);
    await expect(
      service.DeleteNotification({ id: 'x123', userId: 'user1' })
    ).rejects.toThrow('No notification found with that ID');
  });

  it('Should throw error if user not allowed to delete job', async () => {
    mockRepo.GetNotificationById.mockResolvedValueOnce({
      _id: 'noti123',
      userId: 'user1',
      message: 'how are you',
    });

    await expect(
      service.DeleteNotification({ id: 'noti123', userId: 'user0' })
    ).rejects.toThrow('You are not allowed to deleted this notification');
  });

  it('Should throw error if no notification are found', async () => {
    mockRepo.GetNotificationById.mockResolvedValueOnce({
      _id: 'noti123',
      userId: 'user1',
      message: 'how are you',
    });

    mockRepo.DeleteNotification.mockResolvedValueOnce(null);

    await expect(
      service.DeleteNotification({
        id: 'noti123',
        userId: 'user1',
      })
    ).rejects.toThrow('Notification not found!');
  });

  it('Should delete job successfully and return the deleted job', async () => {
    mockRepo.GetNotificationById.mockResolvedValueOnce({
      _id: 'noti123',
      userId: 'user1',
      message: 'how are you',
    });

    mockRepo.DeleteNotification.mockResolvedValueOnce({
      _id: 'noti123',
      userId: 'user1',
      message: 'how are you',
    });

    const result = await service.DeleteNotification({
      id: 'noti123',
      userId: 'user1',
    });

    expect(result).toHaveProperty('data');
    expect(result.data).toMatchObject({
      _id: 'noti123',
      userId: 'user1',
      message: 'how are you',
    });
    expect(mockRepo.GetNotificationById).toHaveBeenCalledWith({
      id: 'noti123',
    });
    expect(mockRepo.DeleteNotification).toHaveBeenCalledWith({ id: 'noti123' });
  });
});

describe('NotificationService - RPCObserver', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationService();
    mockRepo = service.notificationRepository;
  });

  it('should respond with notification data when type is notificationCreate', async () => {
    const mockChannel = {
      assertQueue: jest.fn().mockResolvedValue(true),
      bindQueue: jest.fn(),
      consume: jest.fn(),
      sendToQueue: jest.fn(),
      ack: jest.fn(),
    };
    const fakeNotification = {
      _id: 'noti1',
      userId: 'user1',
      message: 'hello',
    };
    mockRepo.CreateNotification.mockResolvedValue(fakeNotification);

    // Intercept the consume callback
    let consumeCallback;
    mockChannel.consume.mockImplementation((queue, cb) => {
      consumeCallback = cb;
    });

    await service.RPCObserver(mockChannel);

    // Simulate a message
    const msg = {
      content: Buffer.from(
        JSON.stringify({
          type: 'notificationCreate',
          userId: 'user1',
          message: 'hello',
        })
      ),
      properties: {
        replyTo: 'reply-queue',
        correlationId: 'corr-id-1',
      },
    };

    // Call the consume callback as if a message arrived
    await consumeCallback(msg);

    expect(mockRepo.CreateNotification).toHaveBeenCalledWith({
      userId: 'user1',
      message: 'hello',
    });
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      'reply-queue',
      Buffer.from(JSON.stringify(fakeNotification)),
      { correlationId: 'corr-id-1' }
    );
    expect(mockChannel.ack).toHaveBeenCalledWith(msg);
  });
});

describe('NotificationService - ReadAllNotificatiton', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationService();
    mockRepo = service.notificationRepository;
  });

  it('Should throw error if failed to update notification', async () => {
    mockRepo.ReadAllNotification.mockResolvedValue(null);
    await expect(
      service.ReadAllNotificatiton({ userId: 'u123' })
    ).rejects.toThrow('Failed to update notification!');
  });

  it('Should throw error if failed to fetch notifications', async () => {
    mockRepo.ReadAllNotification.mockResolvedValueOnce(true);
    mockRepo.GetAllNotification.mockResolvedValueOnce(null);
    await expect(
      service.ReadAllNotificatiton({ userId: 'u123' })
    ).rejects.toThrow('Falied to fetch all notifications');
  });

  it('Should return notifications successfully', async () => {
    mockRepo.ReadAllNotification.mockResolvedValueOnce(true);
    mockRepo.GetAllNotification.mockResolvedValueOnce([
      { userId: 'u123', status: 'read' },
      { userId: 'u123', status: 'read' },
      { userId: 'u123', status: 'read' },
    ]);

    const result = await service.ReadAllNotificatiton({ userId: 'u123' });

    expect(result).toHaveProperty('data');
    expect(mockRepo.ReadAllNotification).toHaveBeenCalled();
    expect(mockRepo.GetAllNotification).toHaveBeenCalled();
    expect(result.data.length).toBe(3);
    expect(result.data).toMatchObject([
      { userId: 'u123', status: 'read' },
      { userId: 'u123', status: 'read' },
      { userId: 'u123', status: 'read' },
    ]);
  });
});

describe('NotificationService - ReadNotification', () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationService();
    mockRepo = service.notificationRepository;
  });

  it('Should throw error if notification failed to update notification', async () => {
    mockRepo.ReadNotification.mockResolvedValue(false);
    await expect(
      service.ReadNotification({ notifId: 'not123', userId: 'u123' })
    ).rejects.toThrow('Failed to update notification');
  });

  it('Should throw error if notification is failed to fetch', async () => {
    mockRepo.ReadNotification.mockResolvedValue(true);
    mockRepo.GetAllNotification.mockResolvedValue(false);
    await expect(
      service.ReadNotification({ notifId: 'not123', userId: 'u123' })
    ).rejects.toThrow('Failed to fetch all notifications');
  });

  it('Should return all notification successfully', async () => {
    mockRepo.ReadNotification.mockResolvedValue(true);
    mockRepo.GetAllNotification.mockResolvedValueOnce([
      {
        userId: 'u123',
        id: 'not123',
        status: 'read',
      },
      {
        userId: 'u123',
        id: 'not345',
        status: 'read',
      },
      {
        userId: 'u123',
        id: 'not678',
        status: 'unread',
      },
    ]);

    const result = await service.ReadNotification({
      notifId: 'not123',
      userId: 'u123',
    });

    expect(result).toHaveProperty('data');
    expect(mockRepo.ReadNotification).toHaveBeenCalled();
    expect(mockRepo.GetAllNotification).toHaveBeenCalled();
    expect(result.data.length).toBe(3);
    expect(result.data).toMatchObject([
      {
        userId: 'u123',
        id: 'not123',
        status: 'read',
      },
      {
        userId: 'u123',
        id: 'not345',
        status: 'read',
      },
      {
        userId: 'u123',
        id: 'not678',
        status: 'unread',
      },
    ]);
  });
});

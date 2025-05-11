from ultralytics import YOLO
import cv2
import time
import os

# Load model
model = YOLO('yolov8s_custom.pt')

# Choose your mode: 'image' or 'video'
mode = 'video'  # change to 'image' if you want to run on a single image

# Input file path
# input_path = 'runs/detect/predict/1.avi'  # or 'path/to/image.jpg'
# video_path = 'C:\\Users\\akshat\\OneDrive\\Desktop\\Vit\\SY Sem 2\\EDAI\\PPE_detection_using_YOLOV8-main\\runs\\detect\\predict\\1.avi'
input_path = 'C:\\Users\\suraj namdev gitte\\Downloads\\PPE_detection_using_YOLOV8-main\\PPE_detection_using_YOLOV8-main\\runs\\detect\\predict\\1.avi'


# Safety gear list
safety_items = ['Glass', 'Gloves', 'Helmet', 'Safety-Vest']

# Create folder to save violations
output_folder = 'WORKERS/NO_SAFETY'
os.makedirs(output_folder, exist_ok=True)

# Helper function to process frame
def process_frame(frame):
    results = model(frame, verbose=False)
    detected_classes = []

    for r in results:
        for c in r.boxes:
            class_id = int(c.cls)
            class_name = model.names[class_id]
            if class_name in safety_items:
                detected_classes.append(class_name)
                x1, y1, x2, y2 = map(int, c.xyxy[0])
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, class_name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    # Check for missing safety items
    missing = [item for item in safety_items if item not in detected_classes]
    if missing:
        msg = f"❌ Missing: {', '.join(missing)}"
        color = (0, 0, 255)
    else:
        msg = "✅ All Safety Gear Present"
        color = (0, 255, 0)

    # Overlay message
    cv2.putText(frame, msg, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

    return frame, missing

# Mode: Image
if mode == 'image':
    frame = cv2.imread(input_path)
    if frame is None:
        print("Error loading image.")
    else:
        frame, missing = process_frame(frame)
        cv2.imshow("Result", frame)
        if missing:
            now = time.localtime()
            filename = f"{output_folder}/{now.tm_year}{now.tm_mon}{now.tm_mday}_{now.tm_hour}{now.tm_min}{now.tm_sec}.jpg"
            cv2.imwrite(filename, frame)
            print(f"[ALERT] Safety violation saved as {filename}")
        cv2.waitKey(0)

# Mode: Video
else:
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print("Error: Could not open video file.")
        exit()

    last_check_time = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            print("End of video.")
            break

        frame, missing = process_frame(frame)
        cv2.imshow("Result", frame)

        current_time = time.time()
        if current_time - last_check_time >= 15 and missing:
            now = time.localtime()
            filename = f"{output_folder}/{now.tm_year}{now.tm_mon}{now.tm_mday}_{now.tm_hour}{now.tm_min}{now.tm_sec}.jpg"
            cv2.imwrite(filename, frame)
            print(f"[ALERT] Safety violation saved as {filename}")
            last_check_time = current_time

        if cv2.waitKey(1) & 0xFF == 27:
            break

    cap.release()

cv2.destroyAllWindows()

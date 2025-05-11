from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import cv2
import numpy as np
from ultralytics import YOLO
import tempfile
import uuid
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configure upload folder and file size limit
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'mp4', 'avi', 'mov'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create necessary folders with proper permissions
try:
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    logger.info(f"Created directories: {UPLOAD_FOLDER} and {OUTPUT_FOLDER}")
except Exception as e:
    logger.error(f"Error creating directories: {str(e)}")
    raise

# Set permissions (Unix-like systems)
if os.name != 'nt':  # Not Windows
    try:
        os.chmod(UPLOAD_FOLDER, 0o755)
        os.chmod(OUTPUT_FOLDER, 0o755)
        logger.info("Set directory permissions")
    except Exception as e:
        logger.error(f"Error setting permissions: {str(e)}")

# Load models with error handling
try:
    logger.info("Loading YOLO models...")
    ppe_model = YOLO('yolov8s_custom.pt')
    human_model = YOLO('yolov8n.pt')
    logger.info("Models loaded successfully")
except Exception as e:
    logger.error(f"Error loading models: {str(e)}")
    raise

# Safety gear list
safety_items = ['Glass', 'Gloves', 'Helmet', 'Safety-Vest']

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def is_video_file(filename):
    return filename.lower().endswith(('.mp4', '.avi', '.mov'))

def detect_humans(frame):
    results = human_model(frame, verbose=False)
    for r in results:
        for c in r.boxes:
            class_id = int(c.cls)
            class_name = human_model.names[class_id]
            if class_name == 'person':
                return True
    return False

def process_image(image_path):
    try:
        frame = cv2.imread(image_path)
        if frame is None:
            return None, "Error loading image"

        # Detect all persons
        human_results = human_model(frame, verbose=False)
        person_boxes = []
        for r in human_results:
            for c in r.boxes:
                class_id = int(c.cls)
                class_name = human_model.names[class_id]
                if class_name == 'person':
                    x1, y1, x2, y2 = map(int, c.xyxy[0])
                    person_boxes.append({'bbox': (x1, y1, x2, y2), 'items': []})

        if not person_boxes:
            cv2.putText(frame, "❌ No human detected", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            return frame, ["No human detected"]

        # Detect all safety items
        ppe_results = ppe_model(frame, verbose=False)
        item_boxes = []
        for r in ppe_results:
            for c in r.boxes:
                class_id = int(c.cls)
                class_name = ppe_model.names[class_id]
                if class_name in safety_items:
                    x1, y1, x2, y2 = map(int, c.xyxy[0])
                    item_boxes.append({'bbox': (x1, y1, x2, y2), 'class': class_name, 'center': ((x1 + x2) // 2, (y1 + y2) // 2)})

        # Associate items to persons
        for item in item_boxes:
            icx, icy = item['center']
            best_idx = -1
            for idx, person in enumerate(person_boxes):
                px1, py1, px2, py2 = person['bbox']
                if px1 <= icx <= px2 and py1 <= icy <= py2:
                    best_idx = idx
                    break
            if best_idx != -1:
                person_boxes[best_idx]['items'].append(item['class'])

        # Collect all missing items across all persons
        all_missing = set()
        for person in person_boxes:
            present = set(person['items'])
            missing = [item for item in safety_items if item not in present]
            all_missing.update(missing)

        # Draw only person boxes
        for person in person_boxes:
            x1, y1, x2, y2 = person['bbox']
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)  # Blue for person

        # Draw a single message at the top
        if all_missing:
            msg = f"❌ Missing: {', '.join(sorted(all_missing))}"
            color = (0, 0, 255)
        else:
            msg = "✅ All Safety Gear Present"
            color = (0, 255, 0)
        cv2.putText(frame, msg, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

        return frame, sorted(all_missing)
    except Exception as e:
        return None, str(e)

def process_video(video_path):
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logger.error(f"Failed to open video file: {video_path}")
            return None, "Error opening video file"

        # Get video properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        logger.info(f"Video properties: {width}x{height} @ {fps}fps, {total_frames} frames")
        
        # Always use MP4 output with H.264 codec
        output_path = os.path.join(OUTPUT_FOLDER, f"processed_{os.path.basename(video_path)}")
        output_path = output_path.replace('.avi', '.mp4').replace('.mov', '.mp4')
        
        # Try different codecs in order of preference
        codecs = [
            ('avc1', 'H.264'),
            ('mp4v', 'MPEG-4'),
            ('XVID', 'XVID')
        ]
        
        out = None
        for codec_name, codec_desc in codecs:
            try:
                fourcc = cv2.VideoWriter_fourcc(*codec_name)
                out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
                if out.isOpened():
                    logger.info(f"Successfully initialized video writer with {codec_desc} codec")
                    break
            except Exception as e:
                logger.warning(f"Failed to initialize video writer with {codec_desc} codec: {str(e)}")
                continue
        
        if not out or not out.isOpened():
            logger.error("Failed to initialize video writer with any codec")
            return None, "Error creating output video file"

        frame_count = 0
        processed_frames = 0
        missing_items_set = set()
        
        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                # Process every 5th frame to save processing time
                if frame_count % 5 == 0:
                    # Check for human presence
                    if detect_humans(frame):
                        results = ppe_model(frame, verbose=False)
                        detected_classes = []

                        for r in results:
                            for c in r.boxes:
                                class_id = int(c.cls)
                                class_name = ppe_model.names[class_id]
                                if class_name in safety_items:
                                    detected_classes.append(class_name)
                                    x1, y1, x2, y2 = map(int, c.xyxy[0])
                                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                                    cv2.putText(frame, class_name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

                        # Check for missing safety items
                        missing = [item for item in safety_items if item not in detected_classes]
                        missing_items_set.update(missing)
                        
                        if missing:
                            msg = f"❌ Missing: {', '.join(missing)}"
                            color = (0, 0, 255)
                        else:
                            msg = "✅ All Safety Gear Present"
                            color = (0, 255, 0)

                        # Overlay message
                        cv2.putText(frame, msg, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
                        processed_frames += 1
                    else:
                        cv2.putText(frame, "❌ No human detected", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

                out.write(frame)
                frame_count += 1

                # Log progress every 100 frames
                if frame_count % 100 == 0:
                    logger.info(f"Processed {frame_count}/{total_frames} frames")

        except Exception as e:
            logger.error(f"Error during video processing: {str(e)}")
            return None, f"Error during video processing: {str(e)}"
        finally:
            cap.release()
            if out:
                out.release()
        
        # Verify the output file exists and has content
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            logger.info("Video processing completed successfully")
            return output_path, sorted(list(missing_items_set))
        else:
            logger.error("Output video file was not created properly")
            return None, "Error: Output video file was not created properly"
            
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        return None, str(e)

@app.route('/test', methods=['GET'])
def test():
    logger.info("Test endpoint called")
    return jsonify({'message': 'Server is running'}), 200

@app.route('/health', methods=['GET'])
def health_check():
    logger.info("Health check endpoint called")
    try:
        return jsonify({
            'status': 'healthy',
            'models_loaded': bool(ppe_model and human_model),
            'upload_folder_exists': os.path.exists(UPLOAD_FOLDER),
            'output_folder_exists': os.path.exists(OUTPUT_FOLDER),
            'upload_folder_writable': os.access(UPLOAD_FOLDER, os.W_OK),
            'output_folder_writable': os.access(OUTPUT_FOLDER, os.W_OK)
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

@app.route('/process-media', methods=['POST'])
def process_media():
    logger.info("Processing media request received")
    try:
        if 'files' not in request.files:
            logger.error("No files in request")
            return jsonify({'error': 'No files provided'}), 400

        files = request.files.getlist('files')
        if not files:
            logger.error("Empty files list")
            return jsonify({'error': 'No files selected'}), 400

        logger.info(f"Processing {len(files)} files")
        results = []
        
        for file in files:
            if file and allowed_file(file.filename):
                try:
                    # Generate unique filename
                    filename = secure_filename(file.filename)
                    unique_filename = f"{uuid.uuid4()}_{filename}"
                    input_path = os.path.join(UPLOAD_FOLDER, unique_filename)
                    
                    logger.info(f"Processing file: {filename}")
                    
                    # Save uploaded file
                    file.save(input_path)
                    logger.info(f"Saved file to: {input_path}")
                    
                    if is_video_file(filename):
                        logger.info(f"Processing video: {filename}")
                        output_path, missing_items = process_video(input_path)
                        if output_path:
                            results.append({
                                'original_filename': filename,
                                'processed_filename': os.path.basename(output_path),
                                'status': 'success',
                                'type': 'video',
                                'missing_items': missing_items
                            })
                            logger.info(f"Video processed successfully: {filename}")
                        else:
                            logger.error(f"Video processing failed: {filename}")
                            results.append({
                                'original_filename': filename,
                                'error': missing_items,
                                'status': 'error'
                            })
                    else:
                        logger.info(f"Processing image: {filename}")
                        processed_frame, missing = process_image(input_path)
                        if processed_frame is not None:
                            output_path = os.path.join(OUTPUT_FOLDER, unique_filename)
                            cv2.imwrite(output_path, processed_frame)
                            results.append({
                                'original_filename': filename,
                                'processed_filename': unique_filename,
                                'missing_items': missing,
                                'status': 'success',
                                'type': 'image'
                            })
                            logger.info(f"Image processed successfully: {filename}")
                        else:
                            logger.error(f"Image processing failed: {filename}")
                            results.append({
                                'original_filename': filename,
                                'error': missing,
                                'status': 'error'
                            })
                    
                    # Clean up input file
                    if os.path.exists(input_path):
                        os.remove(input_path)
                        logger.info(f"Cleaned up input file: {input_path}")
                    
                except Exception as e:
                    logger.error(f"Error processing file {file.filename}: {str(e)}")
                    results.append({
                        'original_filename': file.filename,
                        'error': str(e),
                        'status': 'error'
                    })
            else:
                logger.error(f"Invalid file type: {file.filename}")
                results.append({
                    'original_filename': file.filename,
                    'error': 'Invalid file type',
                    'status': 'error'
                })

        logger.info("Processing completed")
        return jsonify({
            'results': results
        })
    except Exception as e:
        logger.error(f"Global error in process_media: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/get-processed-media/<filename>', methods=['GET'])
def get_processed_media(filename):
    try:
        file_path = os.path.join(OUTPUT_FOLDER, filename)
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return jsonify({'error': 'File not found'}), 404
            
        # Determine the correct mimetype
        if filename.lower().endswith(('.jpg', '.jpeg')):
            mimetype = 'image/jpeg'
        elif filename.lower().endswith('.png'):
            mimetype = 'image/png'
        elif filename.lower().endswith('.mp4'):
            mimetype = 'video/mp4'
        elif filename.lower().endswith('.avi'):
            mimetype = 'video/x-msvideo'
        elif filename.lower().endswith('.mov'):
            mimetype = 'video/quicktime'
        else:
            mimetype = 'application/octet-stream'
            
        logger.info(f"Sending file {filename} with mimetype {mimetype}")
        return send_file(
            file_path,
            mimetype=mimetype,
            as_attachment=False,  # Changed to False to allow inline playback
            download_name=filename
        )
    except Exception as e:
        logger.error(f"Error sending file {filename}: {str(e)}")
        return jsonify({'error': str(e)}), 404

if __name__ == '__main__':
    logger.info("Starting server...")
    app.run(debug=True, host='0.0.0.0', port=5000) 
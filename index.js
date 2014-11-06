/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var assert = require('assert');
var bunyan = require('bunyan');
var Executor = require('./executor.js');
var findImage = require('./docker').findImage;
var toTargetIp = require('nscale-target-ip');

module.exports = function(config, logger) {
  logger = logger || bunyan.createLogger({name: 'docker-registry-container'});
  var executor = new Executor(config);

  /**
   * build the container 
   * system - the system definition
   * cdef - contianer definition block
   * out - ouput stream 
   * cb - complete callback
   */
  var build = function build(mode, system, containerDef, out, cb) {
    logger.info('building');
    out.stdout('--> building');

    var name = containerDef.specific.name;

    if (!name) {
      return cb(new Error('missing name for definition ' + containerDef.id));
    }

    if (!containerDef.specific.execute) {
      return cb(new Error('missing execute block in ' + containerDef.id + ' container definition'));
    }

    var pullCmd = 'docker pull ' + name;
    var tag = system.name + '/' + containerDef.id;
    var tagCmd = 'docker tag ' + name + ' ' + tag;

    executor.exec(null, pullCmd, out, function(err) {
      if (err) {
        return cb(err);
      }

      executor.exec(null, tagCmd, out, function(err) {

        if (err) {
          return cb(err);
        }

        findImage(tag, function(err, image) {
          if (err) {
            return cb(err);
          }

          var containerBinaryPath = system.repoPath + '/builds/' + image.Id;
          var exportCmd = 'docker save ' + image.Id + ' > ' + containerBinaryPath;
          executor.exec(null, exportCmd, out, function(err) {
            if (err) {
              return cb(err);
            }

            cb(null, {
              dockerImageId: image.Id,
              containerBinary: containerBinaryPath,
              imageTag: tag
            });
          });
        });
      });
    });
  };



  /**
   * deploy the continaer
   * target - target to deploy to
   * system - the target system defintinion
   * cdef - the contianer definition
   * container - the container as defined in the system topology
   * out - ouput stream 
   * cb - complete callback
   */
  var deploy = function deploy(mode, target, system, containerDef, container, out, cb) {
    cb();
  };



  /**
   * undeploy the container from the target
   * target - target to deploy to
   * system - the target system defintinion
   * cdef - the contianer definition
   * container - the container as defined in the system topology
   * out - ouput stream 
   * cb - complete callback
   */
  var undeploy = function undeploy(mode, target, system, containerDef, container, out, cb) {
    cb();
  };



  /**
   * start the container on the target
   * target - target to deploy to
   * system - the target system defintinion
   * cdef - the contianer definition
   * container - the container as defined in the system topology
   * out - ouput stream 
   * cb - complete callback
   */
  var start = function start(mode, target, system, containerDef, container, out, cb) {
    logger.info('starting');
    out.stdout('--> starting');

    var tag = system.name + '/' + containerDef.id;
    var args = containerDef.specific.execute.args || '';
    var exec = containerDef.specific.execute.exec || '';
    var cmd = 'docker run ' + args + ' ' + tag + ' ' + exec;

    cmd = cmd.replace('__TARGETIP__', toTargetIp(target.privateIpAddress));

    if (mode === 'preview') {
      out.preview({ host: target.privateIpAddress || 'localhost', cmd: cmd });
      return cb();
    }

    executor.exec(target.privateIpAddress, cmd, out, cb);
  };



  /**
   * stop the container on the target
   * target - target to deploy to
   * system - the target system defintinion
   * cdef - the contianer definition
   * container - the container as defined in the system topology
   * out - ouput stream 
   * cb - complete callback
   */
  var stop = function stop(mode, target, system, containerDef, container, out, cb) {
    logger.info('stopping');
    out.stdout('stopping');
    cb();
  };



  /**
   * link the container to the target
   * target - target to deploy to
   * system - the target system defintinion
   * cdef - the contianer definition
   * container - the container as defined in the system topology
   * out - ouput stream 
   * cb - complete callback
   */
  var link = function link(mode, target, system, containerDef, container, out, cb) {
    logger.info('linking');
    out.stdout('linking');
    cb();
  };



  /**
   * unlink the container from the target
   * target - target to deploy to
   * system - the target system defintinion
   * cdef - the contianer definition
   * container - the container as defined in the system topology
   * out - ouput stream 
   * cb - complete callback
   */
  var unlink = function unlink(mode, target, system, containerDef, container, out, cb) {
    logger.info('unlinking');
    out.stdout('unlinking');
    cb();
  };



  return {
    build: build,
    deploy: deploy,
    start: start,
    stop: stop,
    link: link,
    unlink: unlink,
    undeploy: undeploy,
    add: deploy,
    remove: undeploy
  };
};

